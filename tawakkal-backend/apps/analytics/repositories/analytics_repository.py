from django.db.models import Sum, Count, F, Q, ExpressionWrapper, FloatField
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta
import calendar

from apps.orders.models import Order, OrderItem
from apps.catalog.models import Product, Category, ProductVariant
from apps.customers.models import Customer
from apps.users.models import User

class AnalyticsRepository:
    
    @classmethod
    def get_dashboard_aggregates(cls):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Determine previous period for comparison (last 30 days vs previous 30 days)
        last_30_start = now - timedelta(days=30)
        prev_30_start = last_30_start - timedelta(days=30)
        
        orders = Order.objects.filter(is_deleted=False)
        products = Product.objects.filter(is_deleted=False)
        categories = Category.objects.filter(is_deleted=False)
        customers = Customer.objects.filter(is_deleted=False)
        
        total_revenue = orders.filter(payment_status__iexact='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Calculate percentage changes
        def calc_change(current, previous):
            if previous == 0:
                return "+100%" if current > 0 else "0%"
            change = ((current - previous) / previous) * 100
            sign = "+" if change >= 0 else ""
            return f"{sign}{round(change, 1)}%"

        # Current period stats
        current_products = products.filter(created_at__gte=last_30_start).count()
        prev_products = products.filter(created_at__gte=prev_30_start, created_at__lt=last_30_start).count()
        products_change = calc_change(current_products, prev_products)

        current_categories = categories.filter(created_at__gte=last_30_start).count()
        prev_categories = categories.filter(created_at__gte=prev_30_start, created_at__lt=last_30_start).count()
        categories_change = calc_change(current_categories, prev_categories)

        current_customers = customers.filter(created_at__gte=last_30_start).count()
        prev_customers = customers.filter(created_at__gte=prev_30_start, created_at__lt=last_30_start).count()
        customers_change = calc_change(current_customers, prev_customers)

        current_orders = orders.filter(created_at__gte=last_30_start).count()
        prev_orders = orders.filter(created_at__gte=prev_30_start, created_at__lt=last_30_start).count()
        orders_change = calc_change(current_orders, prev_orders)

        current_revenue = orders.filter(created_at__gte=last_30_start, payment_status__iexact='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        prev_revenue = orders.filter(created_at__gte=prev_30_start, created_at__lt=last_30_start, payment_status__iexact='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        revenue_change = calc_change(float(current_revenue), float(prev_revenue))
        
        # Orders stats
        total_orders = orders.count()
        pending_orders = orders.filter(status__iexact='PENDING').count()
        completed_orders = orders.filter(status__iexact='DELIVERED').count()
        shipped_orders = orders.filter(status__iexact='SHIPPED').count()
        
        # Stock stats
        low_stock_threshold = 10
        low_stock_products = ProductVariant.objects.filter(is_deleted=False, stock__lte=low_stock_threshold).values('product').distinct().count()
        
        active_customers = customers.filter(status='ACTIVE').count()
        
        # Mocking revenue data for charts based on last 6 months
        six_months_ago = now - timedelta(days=180)
        monthly_data_qs = orders.filter(created_at__gte=six_months_ago).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total_amount', filter=Q(payment_status__iexact='PAID')),
            orders=Count('id')
        ).order_by('month')
        
        revenue_data = []
        for item in monthly_data_qs:
            revenue_data.append({
                'month': item['month'].strftime('%b'),
                'revenue': float(item['revenue'] or 0),
            })

        return {
            'totalProducts': products.count(),
            'productsChange': products_change,
            'totalCategories': categories.count(),
            'categoriesChange': categories_change,
            'totalCustomers': customers.count(),
            'customersChange': customers_change,
            'totalOrders': total_orders,
            'ordersChange': orders_change,
            'revenue': float(total_revenue),
            'revenueChange': revenue_change,
            
            'pendingOrders': pending_orders,
            'completedOrders': completed_orders,
            'shippedOrders': shipped_orders,
            'lowStockProducts': low_stock_products,
            'activeCustomers': active_customers,
            'pendingInquiries': 0,
            'surveyResponses': 0,
            'conversionRate': 0.0,
            'conversionRateChange': "0%",
            
            'revenueData': revenue_data,
            'trafficSources': [],
            'topProducts': []
        }

    @classmethod
    def get_recent_activity(cls, limit=10):
        # We can combine timeline events or just latest orders/customers
        recent_orders = Order.objects.filter(is_deleted=False).order_by('-created_at')[:limit]
        recent_customers = Customer.objects.filter(is_deleted=False).order_by('-created_at')[:limit]
        
        activities = []
        for order in recent_orders:
            activities.append({
                'id': f"o_{order.id}",
                'type': 'order',
                'message': f"New order #{order.order_number} placed",
                'time': order.created_at,
            })
            
        for customer in recent_customers:
            activities.append({
                'id': f"c_{customer.id}",
                'type': 'customer',
                'message': f"New customer {customer.first_name} {customer.last_name} registered",
                'time': customer.created_at,
            })
            
        activities.sort(key=lambda x: x['time'], reverse=True)
        return activities[:limit]

    @classmethod
    def get_overview(cls, period='30d'):
        now = timezone.now()
        days = int(period.replace('d', '')) if period.endswith('d') else 30
        start_date = now - timedelta(days=days)
        previous_start = start_date - timedelta(days=days)
        
        orders = Order.objects.filter(is_deleted=False)
        period_orders = orders.filter(created_at__gte=start_date)
        prev_period_orders = orders.filter(created_at__gte=previous_start, created_at__lt=start_date)
        
        # Revenue stats
        revenue_total = period_orders.filter(payment_status__iexact='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        prev_revenue_total = prev_period_orders.filter(payment_status__iexact='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
        
        revenue_change = 0
        if prev_revenue_total > 0:
            revenue_change = round(((float(revenue_total) - float(prev_revenue_total)) / float(prev_revenue_total)) * 100, 1)
        elif revenue_total > 0:
            revenue_change = 100
            
        # Revenue by month (last 6 months)
        six_months_ago = now - timedelta(days=180)
        monthly_data_qs = orders.filter(created_at__gte=six_months_ago).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total_amount', filter=Q(payment_status__iexact='PAID')),
            orders=Count('id')
        ).order_by('month')
        
        monthly_data = []
        for item in monthly_data_qs:
            monthly_data.append({
                'month': item['month'].strftime('%b'),
                'revenue': float(item['revenue'] or 0),
                'orders': item['orders']
            })
            
        # If no monthly data, mock structure
        if not monthly_data:
            monthly_data = [{'month': now.strftime('%b'), 'revenue': 0, 'orders': 0}]
            
        # Top Products
        top_products_qs = OrderItem.objects.filter(
            order__is_deleted=False, order__created_at__gte=start_date
        ).values('product_name').annotate(
            sales=Sum('quantity'),
            revenue=Sum(F('quantity') * F('unit_price'), output_field=FloatField())
        ).order_by('-sales')[:5]
        
        top_products = []
        for item in top_products_qs:
            top_products.append({
                'name': item['product_name'],
                'sales': item['sales'],
                'revenue': float(item['revenue'] or 0)
            })

        visitors = {
            'total': 0,
            'data': []
        }
        
        trafficSources = []
        
        return {
            'revenue': {
                'total': float(revenue_total),
                'previousPeriod': float(prev_revenue_total),
                'change': revenue_change,
                'data': monthly_data
            },
            'visitors': visitors,
            'trafficSources': trafficSources,
            'conversionRate': 0.0,
            'previousConversionRate': 0.0,
            'topProducts': top_products
        }
