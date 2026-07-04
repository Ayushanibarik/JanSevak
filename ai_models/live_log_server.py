import http.server
import socketserver
import os

PORT = 8080
LOG_FILE = r"C:\Users\AYUSH\.gemini\antigravity-ide\brain\b2364a33-8708-490a-8ac1-14bf97f2caf6\.system_generated\tasks\task-941.log"

class LogHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        if not os.path.exists(LOG_FILE):
            content = "Log file not found yet..."
        else:
            with open(LOG_FILE, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
                content = "".join(lines[-100:])
                
        html = f"""
        <html>
            <head>
                <title>YOLOv8 Live Training View</title>
                <meta http-equiv="refresh" content="2">
                <style>
                    body {{ background-color: #1e1e1e; color: #00ff00; font-family: monospace; padding: 20px; }}
                    pre {{ white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }}
                    .header {{ border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; }}
                    h2 {{ color: #fff; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>YOLOv8 Pothole Detector - Live Training Logs</h2>
                    <p>Auto-refreshing every 2 seconds...</p>
                </div>
                <pre>{content}</pre>
            </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

with socketserver.TCPServer(("", PORT), LogHandler) as httpd:
    print(f"Serving live logs at port {PORT}")
    httpd.serve_forever()
