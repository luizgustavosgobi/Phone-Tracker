"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Avatar, AvatarImage } from "@/app/components/ui/avatar";
import { ElementType } from "react";

type PropsIconAction = {
  icon: ElementType;
  classNameIcon?: string;
  tooltipContent: string;
  onClick?: () => void;
};

type PropsIconExludeAction = Pick<PropsIconAction, "icon" | "classNameIcon"> & {
  name: string;
  id: string;
  photo?: string;
  confirmationMessage: string;
  deleteElement: (userId: string) => Promise<void>;
};

function StandardIconAction({
  icon: Icon,
  tooltipContent,
  classNameIcon,
  onClick,
}: PropsIconAction) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer rounded-md p-2" onClick={onClick}>
            <Icon className={classNameIcon} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function IconExcludeAction({
  icon: Icon,
  name,
  id,
  photo,
  confirmationMessage,
  classNameIcon,
  deleteElement,
  statusOccurrence,
}: PropsIconExludeAction & { statusOccurrence?: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer rounded-md p-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Icon className={classNameIcon} />
              </AlertDialogTrigger>
              <AlertDialogContent className="border border-zinc-400 bg-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-zinc-50">
                    {confirmationMessage}
                  </AlertDialogTitle>
                  <div className="m-auto my-[1rem] flex w-fit items-center justify-center gap-5 rounded-md border bg-zinc-700 p-4">
                    {photo && (
                      <Avatar className="h-25 w-25">
                        <AvatarImage className="object-cover" src={photo} />
                      </Avatar>
                    )}

                    <div className="relative text-center text-zinc-50">
                      {statusOccurrence}
                      <h2 className="text-2xl font-bold">{name}</h2>
                      <p>{id}</p>
                    </div>
                  </div>
                  <AlertDialogDescription className="text-gray-200">
                    Essa ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer border-none bg-green-700 text-zinc-50 hover:bg-green-600 hover:text-zinc-50">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="cursor-pointer bg-red-700 hover:bg-red-600"
                    onClick={() => deleteElement(id)}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Deletar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { StandardIconAction, IconExcludeAction };
