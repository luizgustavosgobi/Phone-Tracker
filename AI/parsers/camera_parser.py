camera_config_folder = "cameras.conf"

cameras: dict[int, tuple[str, str]] = {}

def parseCameraConfigFile():
    camera_auto_id = 1

    try:
        with open(camera_config_folder, 'r', encoding='utf-8') as file:
            lines = file.read().splitlines()

            for line in lines:

                if line.startswith("#") or line == "":
                    continue

                parameters = line.split(" ")
                if len(parameters) != 3:
                    continue

                id, url, local = parameters
                if id == "auto" or int(id) in cameras:
                    while camera_auto_id in cameras:
                        camera_auto_id += 1
                    id = camera_auto_id
                else:
                    id = int(id)

                cameras[id] = (url, local)
        return cameras
    except FileNotFoundError:
        print(f"Arquivo {camera_config_folder} não encontrado")
        return []
    except Exception as e:
        print(f"Erro ao ler arquivo: {e}")
        return []

def getCameraInfos(cameraId: int):
    return cameras[cameraId]