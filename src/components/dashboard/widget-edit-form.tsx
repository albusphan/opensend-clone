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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Widget as WidgetComponent } from "@/components/dashboard/widget";

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

    toast.success("Widget updated", {
      description: "Your widget has been updated successfully",
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form when closing without saving
    setTitle(widget.title);
    setDescription(widget.description);
    onClose();
  };

  // Create preview widget with current form values
  const previewWidget = {
    ...widget,
    title,
    description,
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Configure widget</DialogTitle>
          <DialogDescription>
            Add a title and select data to display on the overview page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Widget Preview */}
          <div className="flex-1">
            <WidgetComponent
              widget={previewWidget}
              onRemove={() => {}}
              isAdmin={false}
            />
          </div>

          {/* Right column - Edit Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-muted rounded-lg mb-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Widget type
                </div>
                <div className="font-medium">{widget.type}</div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-base">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter widget title"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-base">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter widget description"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Back
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
