from scapy.all import ARP, Ether, srp
import socket
from flask import Flask, request, jsonify

app = Flask(__name__)

def scan(ip):
   
    arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=ip)
    
    result = srp(arp_request, timeout=1, verbose=False)[0]
    
    devices = [{'ip': received.psrc, 'mac': received.hwsrc} for sent, received in result]
    return devices
def get_device_names(devices):
    device_names = []
    for device in devices:
        try:
           
            host_name, _, _ = socket.gethostbyaddr(device['ip'])
            device_names.append({'ip': device['ip'], 'mac': device['mac'], 'name': host_name})
        except socket.herror:
           
            device_names.append({'ip': device['ip'], 'mac': device['mac'], 'name': 'Unknown'})
    return device_names
def print_results(devices):
    print("IP Address\t\tMAC Address\t\tDevice Name")
    print("--------------------------------------------------------")
    for device in devices:
        print(f"{device['ip']}\t\t{device['mac']}\t\t{device['name']}")

@app.route("/register", methods=["POST"])
def register():
    ip_addresses = request.remote_addr

    try:
        hostname = socket.gethostbyaddr(ip_addresses)[0]
    except socket.herror:
        hostname = "Unknown"

    client_ip = request.remote_addr or "0.0.0.0"
    user_agent = request.headers.get("User-Agent", "Unknown")

    mac_addresses = scan(ip_addresses)

    data = {
        "ip": ip_addresses,
        "hostname": hostname,
        "mac": mac_addresses if mac_addresses else "Unknown (outside LAN)",
        "user_agent": user_agent
    }

    print("Registered device:", data)
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
