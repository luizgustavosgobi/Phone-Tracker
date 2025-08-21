import threading


def submitToThread(function, args=None, daemon=False):
    thread = threading.Thread(target=function, daemon=daemon, args=args)
    thread.start()
    return thread