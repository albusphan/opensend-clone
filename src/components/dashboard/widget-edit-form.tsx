import { useState } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { updateWidget } from "@/lib/redux/dashboardSlice";
import type { Widget } from "@/lib/redux/dashboardSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface WidgetEditFormProps {
  widget: Widget;
  open: boolean;
  onClose: () => void;
}

export function WidgetEditForm({ widget, open, onClose }: WidgetEditFormProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(widget.title);
  const [description, setDescription] = useState(widget.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateWidget({
        ...widget,
        title,
        description,
      })
    );
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing without saving
    setTitle(widget.title);
    setDescription(widget.description);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{widget.icon}</span>
            Configure Widget
          </DialogTitle>
          <DialogDescription>
            Update the title and description of this widget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter widget description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !description.trim()}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
