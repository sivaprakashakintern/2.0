import os
import subprocess
import socket
import time
import sys

# CONFLUENZE - Automation Launcher (ROBUST VERSION)

def get_ips():
    """Get all valid local IP addresses."""
    ips = []
    try:
        # Get host name
        hostname = socket.gethostname()
        # Get all IPs associated with hostname
        host_info = socket.gethostbyname_ex(hostname)
        for ip in host_info[2]:
            if not ip.startswith("127."):
                ips.append(ip)
    except:
        pass
    
    # Fallback method
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
        if IP not in ips: ips.append(IP)
        s.close()
    except:
        pass
    return ips

def run_command(command, cwd):
    # Use CREATE_NEW_CONSOLE to see the output of each server separately if needed
    # but for simplicity we'll just pipe them here.
    return subprocess.Popen(command, cwd=cwd, shell=True)

def main():
    print("="*60)
    print("      🚀 CONFLUENZE - RELOADED LAN QUIZ SYSTEM")
    print("="*60)
    
    ips = get_ips()
    primary_ip = ips[0] if ips else "127.0.0.1"
    
    print(f"\n📡 SERVER DETECTED IPs:")
    for ip in ips:
        print(f"   -> http://{ip}:5666")
    
    print(f"\n🔗 RECOMMENDED URL FOR STUDENTS: http://{primary_ip}:5666")
    print(f"🛠  ADMIN URL: http://{primary_ip}:5666/login")
    print("\n📍 Organized by: Nehru Institute of Information Technology and Management (MCA)")
    
    print("\n" + "!"*60)
    print("⚠️  IF STUDENTS CANNOT CONNECT:")
    print("1. Set your Network to 'PRIVATE' in Windows Settings.")
    print("2. Turn OFF Windows Firewall or allow port 5666 & 5000.")
    print("3. Ensure all students are on the SAME WiFi / Hotspot.")
    print("!"*60 + "\n")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    server_dir = os.path.join(base_dir, "server")
    client_dir = os.path.join(base_dir, "client")

    # 1. Check/Install deps
    if not os.path.exists(os.path.join(server_dir, "node_modules")):
        print("📦 Installing Backend dependencies...")
        subprocess.run("npm install", cwd=server_dir, shell=True)

    if not os.path.exists(os.path.join(client_dir, "node_modules")):
        print("📦 Installing Frontend dependencies...")
        subprocess.run("npm install", cwd=client_dir, shell=True)

    # 2. Setup Database (Only run this manually if you want a CLEAN start)
    # print("🗄  Initializing Database...")
    # subprocess.run("node setup-db.js", cwd=server_dir, shell=True)

    # 3. Start Backend
    print("🟢 Starting Backend Server...")
    backend_proc = run_command("node index.js", server_dir)

    # 4. Start Frontend
    print("🔵 Starting Frontend (Vite)...")
    # Vite --host 0.0.0.0 is critical for LAN
    frontend_proc = run_command("npm run dev -- --host 0.0.0.0", client_dir)

    print("\n✅ BOTH SERVERS ARE RUNNING!")
    print("Keep this window open to maintain the connection.\n")
    print("="*60)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
