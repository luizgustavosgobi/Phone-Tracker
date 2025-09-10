from multiprocessing import freeze_support
from pathlib import Path

import torch
from rfdetr import RFDETRSmall, RFDETRBase
from rfdetr.detr import RFDETR
from rfdetr.engine import evaluate
from rfdetr.datasets import build_dataset
from rfdetr.datasets import get_coco_api_from_dataset
from rfdetr.models import build_criterion_and_postprocessors
from torch.utils.data import DataLoader
import rfdetr.util.misc as utils
from rfdetr.main import populate_args

model_functions = {'s':RFDETRSmall, 'b':RFDETRBase}
model_resolutions= {'s': 640, 'b': 672}

# Dataset must be on COCO notation downloaded from Roboflow
def eval_rfdetr(dataset, modelPath, modelSize='s'):
    model = model_functions[modelSize](pretrain_weights=modelPath, num_classes=3, resolution=model_resolutions[modelSize])

    args = populate_args(
        dataset_dir=Path(dataset),
        dataset_file='roboflow',
        patch_size=8,
        num_workers=2,
        device='cuda' if torch.cuda.is_available() else 'cpu',
        resolution=model_resolutions[modelSize],
        fp16_eval=False,
        num_windows=4
    )

    dataset_test = build_dataset(image_set='val', args=args, resolution=args.resolution)
    data_loader_test = DataLoader(
        dataset_test,
        args.batch_size,
        sampler=torch.utils.data.SequentialSampler(dataset_test),
        drop_last=False,
        collate_fn=utils.collate_fn,
        num_workers=args.num_workers
    )

    base_ds_test = get_coco_api_from_dataset(dataset_test)
    criterion, postprocessors = build_criterion_and_postprocessors(args)

    device = torch.device(args.device)
    test_stats, coco_evaluator = evaluate(
        model.model.model,
        criterion,
        postprocessors,
        data_loader_test,
        base_ds_test,
        device,
        args
    )

    return test_stats["results_json"]["class_map"]