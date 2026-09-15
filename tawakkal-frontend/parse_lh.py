import json
import sys
import collections

try:
    with open('lighthouse-report.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    audits = data['audits']
    
    print("--- LIGHTHOUSE RESULTS ---")
    print(f"FCP: {audits.get('first-contentful-paint', {}).get('displayValue')}")
    print(f"LCP: {audits.get('largest-contentful-paint', {}).get('displayValue')}")
    print(f"TBT: {audits.get('total-blocking-time', {}).get('displayValue')}")
    print(f"CLS: {audits.get('cumulative-layout-shift', {}).get('displayValue')}")
    print(f"Speed Index: {audits.get('speed-index', {}).get('displayValue')}")
    
    print("\n--- NETWORK REQUESTS ---")
    reqs = audits.get('network-requests', {}).get('details', {}).get('items', [])
    
    total_bytes = 0
    img_bytes = 0
    js_bytes = 0
    css_bytes = 0
    font_bytes = 0
    font_count = 0
    
    req_counts = collections.Counter()
    
    for r in reqs:
        rtype = r.get('resourceType', 'Other')
        size = r.get('transferSize', 0)
        url = r.get('url', '')
        
        total_bytes += size
        if rtype == 'Image':
            img_bytes += size
        elif rtype == 'Script':
            js_bytes += size
        elif rtype == 'Stylesheet':
            css_bytes += size
        elif rtype == 'Font':
            font_bytes += size
            font_count += 1
            
        req_counts[url] += 1
        
    print(f"Total Transfer: {total_bytes / 1024:.2f} KB")
    print(f"Images: {img_bytes / 1024:.2f} KB")
    print(f"JS: {js_bytes / 1024:.2f} KB")
    print(f"CSS: {css_bytes / 1024:.2f} KB")
    print(f"Fonts: {font_bytes / 1024:.2f} KB ({font_count} requests)")
    print(f"Total Requests: {len(reqs)}")
    
    print("\n--- DUPLICATE REQUESTS (API/Fonts) ---")
    for url, count in req_counts.items():
        if count > 1 and ('api' in url or 'font' in url):
            print(f"{count}x: {url}")
            
    print("\n--- HERO IMAGE ---")
    for r in reqs:
        if 'hero' in r.get('url', '').lower() and r.get('resourceType') == 'Image':
            print(f"URL: {r.get('url')}")
            print(f"Size: {r.get('transferSize', 0) / 1024:.2f} KB")
            print(f"Timing (ms): {r.get('startTime', 0)}")
            
    print("\n--- PRODUCT CARD IMAGES ---")
    for r in reqs:
        if 'thumb' in r.get('url', '').lower() or 'card' in r.get('url', '').lower() or 'webp' in r.get('url', '').lower():
            if 'hero' not in r.get('url', '').lower():
                print(f"Size: {r.get('transferSize', 0) / 1024:.2f} KB - {r.get('url')}")

except Exception as e:
    print("Error parsing:", e)
