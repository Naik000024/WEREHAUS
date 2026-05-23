from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from order.models import Product, Inventory, Order, OrderItem
from django.utils import timezone

User = get_user_model()

class WerehausTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users with different roles
        self.admin_user = User.objects.create_user(
            username='admin_operator',
            email='admin@werehaus.com',
            password='password123',
            is_admin=True,
            is_staff=True,
            is_active=True
        )
        self.staff_user = User.objects.create_user(
            username='staff_operator',
            email='staff@werehaus.com',
            password='password123',
            is_admin=False,
            is_staff=True,
            is_active=True
        )
        self.basic_user = User.objects.create_user(
            username='basic_operator',
            email='operator@werehaus.com',
            password='password123',
            is_admin=False,
            is_staff=False,
            is_active=True
        )
        self.inactive_user = User.objects.create_user(
            username='inactive_operator',
            email='inactive@werehaus.com',
            password='password123',
            is_admin=False,
            is_staff=False,
            is_active=False
        )

        # Create sample products
        self.product1 = Product.objects.create(
            name='Cybernetic Arm',
            sku='CYB-001',
            price=1500.00
        )
        self.inventory1 = Inventory.objects.create(
            product=self.product1,
            quantity_available=15
        )

        self.product2 = Product.objects.create(
            name='Neon Visor',
            sku='NEO-999',
            price=120.00
        )
        self.inventory2 = Inventory.objects.create(
            product=self.product2,
            quantity_available=5
        )

        # Create unreferenced product to test deletion
        self.product3 = Product.objects.create(
            name='Unreferenced Visor',
            sku='UNREF-001',
            price=50.00
        )
        self.inventory3 = Inventory.objects.create(
            product=self.product3,
            quantity_available=1
        )

        # Create sample order
        self.order1 = Order.objects.create(
            customer_name='Nova Corp',
            status='PENDING'
        )
        self.order_item1 = OrderItem.objects.create(
            order=self.order1,
            product=self.product1,
            quantity=2
        )

    def test_email_activation_requirement(self):
        # Inactive user should not be able to obtain auth token
        response = self.client.post('/user/auth/jwt/create/', {
            'email': 'inactive_operator@werehaus.com', # USERNAME_FIELD is email!
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Active basic user should succeed
        response = self.client.post('/user/auth/jwt/create/', {
            'email': 'operator@werehaus.com', # USERNAME_FIELD is email!
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_rbac_product_creation(self):
        # Basic operator is read-only and cannot create products
        self.client.force_authenticate(user=self.basic_user)
        response = self.client.post('/api/products/', {
            'name': 'Hologram Projector',
            'sku': 'HOL-777',
            'price': 450.00,
            'initial_stock': 10
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Staff can create products
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/products/', {
            'name': 'Hologram Projector',
            'sku': 'HOL-777',
            'price': '450.00',
            'initial_stock': 10
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_rbac_product_deletion(self):
        # Basic user cannot delete products
        self.client.force_authenticate(user=self.basic_user)
        response = self.client.delete(f'/api/products/{self.product3.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin user can delete products
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/products/{self.product3.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_rbac_order_fulfillment(self):
        # Basic user cannot fulfill orders
        self.client.force_authenticate(user=self.basic_user)
        response = self.client.post(f'/api/orders/{self.order1.id}/fulfill/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Staff user can fulfill orders
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(f'/api/orders/{self.order1.id}/fulfill/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify inventory decreased
        self.inventory1.refresh_from_db()
        self.assertEqual(self.inventory1.quantity_available, 13)

    def test_chatbot_commands(self):
        self.client.force_authenticate(user=self.basic_user)
        
        # Help command
        response = self.client.post('/api/chatbot/', {'message': 'help'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('WEREHAUS_INTELLIGENCE_ONLINE', response.data['reply'])

        # Report/metrics command
        response = self.client.post('/api/chatbot/', {'message': 'give me a report'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('SYSTEM_METRICS_LOG', response.data['reply'])

        # Inventory check (specific sku)
        response = self.client.post('/api/chatbot/', {'message': 'what is the stock of CYB-001?'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('AUDIT_INVENTORY_MATCH', response.data['reply'])

        # Inventory check (general/low stock)
        response = self.client.post('/api/chatbot/', {'message': 'stock'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('LOW_STOCK_AUDIT', response.data['reply'])

        # Order status tracking
        response = self.client.post('/api/chatbot/', {'message': f'status of order {self.order1.id}'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('TRACK_ORDER_RESOLVED', response.data['reply'])

    # ---------------------------------------------------------------
    # ORDER DETAIL MODAL TESTS
    # ---------------------------------------------------------------

    def test_order_detail_fields_in_serializer(self):
        """Order API should return location, assigned_deliverer, shipped_at."""
        self.client.force_authenticate(user=self.basic_user)
        response = self.client.get(f'/api/orders/{self.order1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('location', response.data)
        self.assertIn('assigned_deliverer', response.data)
        self.assertIn('shipped_at', response.data)
        self.assertIn('order_date', response.data)

    def test_order_location_default(self):
        """Newly created orders should default to Luzon."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(f'/api/orders/{self.order1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['location'], 'Luzon')

    def test_patch_order_location(self):
        """Admin/staff should be able to PATCH a new location onto an order."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f'/api/orders/{self.order1.id}/',
            {'location': 'Visayas'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['location'], 'Visayas')
        self.order1.refresh_from_db()
        self.assertEqual(self.order1.location, 'Visayas')

    def test_patch_order_assigned_deliverer(self):
        """Admin/staff should be able to assign a deliverer via PATCH."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.patch(
            f'/api/orders/{self.order1.id}/',
            {'assigned_deliverer': 'Mark'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['assigned_deliverer'], 'Mark')
        self.order1.refresh_from_db()
        self.assertEqual(self.order1.assigned_deliverer, 'Mark')

    def test_basic_user_cannot_patch_order(self):
        """Basic read-only users should not be able to PATCH order fields."""
        self.client.force_authenticate(user=self.basic_user)
        response = self.client.patch(
            f'/api/orders/{self.order1.id}/',
            {'assigned_deliverer': 'Nyko'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fulfill_sets_shipped_at(self):
        """Fulfilling an order should automatically set shipped_at timestamp."""
        self.client.force_authenticate(user=self.staff_user)
        before = timezone.now()
        response = self.client.post(f'/api/orders/{self.order1.id}/fulfill/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order1.refresh_from_db()
        self.assertIsNotNone(self.order1.shipped_at)
        self.assertGreaterEqual(self.order1.shipped_at, before)
        self.assertEqual(self.order1.status, 'SHIPPED')

    def test_order_list_includes_detail_fields(self):
        """The orders list endpoint should include the new detail fields for each order."""
        self.client.force_authenticate(user=self.basic_user)
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        order_data = response.data[0]
        self.assertIn('location', order_data)
        self.assertIn('assigned_deliverer', order_data)
        self.assertIn('shipped_at', order_data)

