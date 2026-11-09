#!/usr/bin/env python3
"""Servidor de la web de SHUA para la red local.

Uso:  python servidor.py   (o doble clic en el lanzador de tu sistema)
Abre la web en este ordenador y muestra la dirección para verla
desde el móvil u otros equipos conectados a la misma wifi.
"""
import http.server
import mimetypes
import os
import socket
import socketserver
import sys
import threading
import webbrowser

# Tipos MIME correctos: en Windows el registro a veces sirve .js como texto
# y entonces el navegador no carga los módulos de la web.
for ext, mime in {
    '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.html': 'text/html',
}.items():
    mimetypes.add_type(mime, ext)

CARPETA = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css'}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CARPETA, **kwargs)

    def log_message(self, *args):
        pass  # sin ruido en la consola


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def ip_local():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))  # no envía nada, solo elige la interfaz
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


def main():
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    for intento in range(20):
        try:
            httpd = Servidor(('0.0.0.0', puerto + intento), Handler)
            puerto += intento
            break
        except OSError:
            continue
    else:
        print('No hay ningún puerto libre entre', puerto, 'y', puerto + 19)
        sys.exit(1)

    ip = ip_local()
    print()
    print('  SHUA French Taco · web en marcha')
    print('  ---------------------------------')
    print(f'  En este ordenador:        http://localhost:{puerto}')
    if ip:
        print(f'  En el móvil (misma wifi): http://{ip}:{puerto}')
    print()
    print('  Para pararla, cierra esta ventana o pulsa Ctrl+C.')
    print()

    threading.Timer(1.0, lambda: webbrowser.open(f'http://localhost:{puerto}')).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n  Web parada.')


if __name__ == '__main__':
    main()
