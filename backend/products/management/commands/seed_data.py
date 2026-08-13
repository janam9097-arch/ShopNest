from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from categories.models import Category
from products.models import Product, ProductImage
from reviews.models import Review
from orders.models import Order, OrderItem
from payments.models import Payment
from users.models import Address
import random
import uuid
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds categories, products, users, reviews, addresses, and order history for ShopNest.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting database seeding..."))

        # 1. Create a demo customer user (if not exists)
        customer, created = User.objects.get_or_create(
            email='customer@shopnest.com',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Customer',
                'is_staff': False
            }
        )
        if created:
            customer.set_password('CustomerPassword123')
            customer.save()
            self.stdout.write(self.style.SUCCESS("Created demo customer: customer@shopnest.com"))

        # Create multiple mock customer users for reviews
        customers_list = [customer]
        mock_emails = [
            ('alice@shopnest.com', 'Alice', 'Smith'),
            ('bob@shopnest.com', 'Bob', 'Jones'),
            ('charlie@shopnest.com', 'Charlie', 'Brown'),
            ('david@shopnest.com', 'David', 'Miller'),
        ]
        for email, first, last in mock_emails:
            c, created_mock = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'is_staff': False
                }
            )
            if created_mock:
                c.set_password('CustomerPassword123')
                c.save()
            customers_list.append(c)

        # Create demo address for the customer
        Address.objects.get_or_create(
            user=customer,
            defaults={
                'full_name': 'Demo Customer',
                'phone': '+91 98765 43210',
                'address_line': 'Flat 302, Palm Heights, Residency Road',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'postal_code': '560001',
                'country': 'India',
                'is_default': True
            }
        )

        # 2. Create Categories
        categories_data = [
            {'name': 'Electronics', 'slug': 'electronics', 'description': 'Gadgets, phones, and devices.'},
            {'name': 'Fashion', 'slug': 'fashion', 'description': 'Apparel, clothing, and styles.'},
            {'name': 'Home & Living', 'slug': 'home-living', 'description': 'Furniture, kitchen, decor.'},
            {'name': 'Sports', 'slug': 'sports', 'description': 'Fitness, gears, outdoor equipment.'},
            {'name': 'Books', 'slug': 'books', 'description': 'Novels, literature, academic books.'},
            {'name': 'Beauty', 'slug': 'beauty', 'description': 'Cosmetics, skincare, beauty products.'},
        ]

        categories_map = {}
        for cat in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat['slug'],
                defaults={
                    'name': cat['name'],
                    'description': cat['description'],
                    'is_active': True
                }
            )
            categories_map[cat['slug']] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {cat['name']}"))

        # 3. Create Products
        products_data = [
            # Electronics
            {
                'category': 'electronics',
                'name': 'ShopNest Premium Wireless Noise Cancelling Headphones',
                'slug': 'premium-wireless-headphones',
                'brand': 'SoundNest',
                'price': 8999.00,
                'discount_price': 6999.00,
                'stock': 15,
                'sku': 'SND-HD-001',
                'description': 'Experience pure studio-quality sound with SoundNest Premium Active Noise Cancelling Headphones. Lightweight, ergonomic, with 40-hour long battery life.'
            },
            {
                'category': 'electronics',
                'name': 'ShopNest Ultra-Thin Smartwatch Series 5',
                'slug': 'smartwatch-series-5',
                'brand': 'NestWatch',
                'price': 14999.00,
                'discount_price': 11999.00,
                'stock': 25,
                'sku': 'NW-SW-005',
                'description': 'Track your fitness goals and stay connected with the NestWatch Ultra-Thin Smartwatch. AMOLED display, blood oxygen monitor, and custom dials.'
            },
            # Fashion
            {
                'category': 'fashion',
                'name': 'ShopNest Classic Slim Fit Denim Jacket',
                'slug': 'slim-fit-denim-jacket',
                'brand': 'NestWear',
                'price': 2999.00,
                'discount_price': 1999.00,
                'stock': 30,
                'sku': 'NW-DJ-001',
                'description': 'Elevate your wardrobe with our classic blue denim jacket. Tailored fit, high-quality washed cotton denim, and functional front chest pockets.'
            },
            # Home & Living
            {
                'category': 'home-living',
                'name': 'ShopNest Modern Geometric Ceramic Flower Vase',
                'slug': 'geometric-flower-vase',
                'brand': 'NestDecor',
                'price': 1499.00,
                'discount_price': 999.00,
                'stock': 40,
                'sku': 'ND-FV-001',
                'description': 'Handcrafted minimalist ceramic flower vase with geometric edges. Perfect accent piece for living rooms, shelves, or office desks.'
            },
            # Sports
            {
                'category': 'sports',
                'name': 'ShopNest Eco-Friendly Non-Slip Yoga Mat',
                'slug': 'non-slip-yoga-mat',
                'brand': 'NestFit',
                'price': 1999.00,
                'discount_price': 1499.00,
                'stock': 50,
                'sku': 'NF-YM-001',
                'description': 'Dual-layer TPE eco-friendly yoga mat with alignment lines. Non-slip texture, thick cushioning (6mm) for joints protection.'
            },
            # Books
            {
                'category': 'books',
                'name': 'Antigravity AI: The Future of Coding Workflows',
                'slug': 'antigravity-ai-future-coding',
                'brand': 'Deepmind Press',
                'price': 799.00,
                'discount_price': 699.00,
                'stock': 100,
                'sku': 'DP-BK-001',
                'description': 'A detailed blueprint on modern agentic coding interfaces, pair programming paradigms, and automating complex web workflows with LLMs.'
            }
        ]

        products_list = []
        for prod in products_data:
            category = categories_map[prod['category']]
            product, created = Product.objects.get_or_create(
                slug=prod['slug'],
                defaults={
                    'category': category,
                    'name': prod['name'],
                    'brand': prod['brand'],
                    'price': prod['price'],
                    'discount_price': prod['discount_price'],
                    'stock': prod['stock'],
                    'sku': prod['sku'],
                    'description': prod['description'],
                    'is_active': True
                }
            )
            products_list.append(product)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created product: {prod['name']}"))

        # 4. Create Reviews
        reviews_comments = [
            "Absolutely fantastic! Highly recommend it.",
            "Great value for money, very happy with the quality.",
            "Decent product, but delivery took longer than expected.",
            "Outstanding performance, exceeds expectations!",
            "Good quality construction and very durable."
        ]

        for prod in products_list:
            # Check if reviews already exist
            if not prod.reviews.exists():
                # Pick a random subset of customers to review the product
                reviewers = random.sample(customers_list, random.randint(2, 4))
                for reviewer in reviewers:
                    rating = random.choice([4, 5, 5, 4, 3]) # Bias towards higher ratings
                    Review.objects.create(
                        product=prod,
                        user=reviewer,
                        rating=rating,
                        comment=random.choice(reviews_comments)
                    )
                self.stdout.write(self.style.SUCCESS(f"Generated reviews for: {prod.name}"))

        # 5. Create Order History
        if not Order.objects.filter(user=customer).exists():
            for i in range(3):
                # Backdate the orders
                days_ago = 10 * (i + 1)
                order_date = timezone.now() - timedelta(days=days_ago)

                subtotal = 0
                selected_prods = random.sample(products_list, 2)
                
                # Make shipping address snapshot
                shipping_address = {
                    "full_name": "Demo Customer",
                    "phone": "+91 98765 43210",
                    "address_line": "Flat 302, Palm Heights, Residency Road",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "postal_code": "560001",
                    "country": "India"
                }

                # Create Order
                order = Order.objects.create(
                    user=customer,
                    status=Order.Status.DELIVERED,
                    payment_status=Order.PaymentStatus.PAID,
                    payment_method='stripe',
                    shipping_address=shipping_address,
                    notes='Deliver during daytime hours',
                    subtotal=0,
                    shipping_cost=0,
                    tax=0,
                    total=0
                )
                order.created_at = order_date
                order.save()

                for prod in selected_prods:
                    qty = random.randint(1, 2)
                    price = prod.discount_price or prod.price
                    subtotal += price * qty
                    
                    OrderItem.objects.create(
                        order=order,
                        product=prod,
                        product_name=prod.name,
                        price=price,
                        quantity=qty,
                        subtotal=price * qty
                    )

                from decimal import Decimal
                shipping_cost = Decimal('0') if subtotal > Decimal('499') else Decimal('49')
                tax = round(subtotal * Decimal('0.18'), 2)
                total = subtotal + shipping_cost + tax

                order.subtotal = subtotal
                order.shipping_cost = shipping_cost
                order.tax = tax
                order.total = total
                order.save()

                # Record corresponding payment
                Payment.objects.create(
                    order=order,
                    user=customer,
                    method=Payment.Method.STRIPE,
                    status=Payment.Status.COMPLETED,
                    amount=total,
                    stripe_payment_intent_id=f'pi_seed_{uuid.uuid4().hex[:12]}'
                )

            self.stdout.write(self.style.SUCCESS("Generated completed order history."))

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
