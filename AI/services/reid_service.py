import torch
import torchreid
from PIL import Image
from torchvision import transforms
import cv2 as cv
import numpy as np

#
# Set up the Model
#

model = torchreid.models.build_model(
    name='osnet_x1_0',
    num_classes=1501,
    pretrained=True
)

model.eval()

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model.to(device)

transform = transforms.Compose([
    transforms.ToTensor(),
])

#
# Service Functions
#

def extract_features(crop: np.ndarray) -> np.ndarray:
    if crop.size == 0:
        raise ValueError("Empty crop image")

    img = Image.fromarray(cv.cvtColor(crop, cv.COLOR_BGR2RGB))
    img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        features = model(img)

    return features.cpu().numpy().flatten()