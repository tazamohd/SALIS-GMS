import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastViewport,
} from "rest-express";

export const Default = () => (
  <ToastProvider swipeDirection="right">
    <Toast open duration={Infinity} style={{ animation: "none" }}>
      <div className="grid gap-1">
        <ToastTitle>Job card JC-1042 saved</ToastTitle>
        <ToastDescription>
          Brake overhaul for Toyota Hilux (B 4521 TX) assigned to technician
          Hamid Khan.
        </ToastDescription>
      </div>
      <ToastAction altText="View job card">View</ToastAction>
      <ToastClose />
    </Toast>
    {/* The capture card wraps cells in a transformed container, so the
        default fixed-position viewport anchors offscreen — render it
        statically for the static preview. */}
    <ToastViewport style={{ position: "static", maxWidth: "100%" }} />
  </ToastProvider>
);

export const Destructive = () => (
  <ToastProvider swipeDirection="right">
    <Toast
      open
      duration={Infinity}
      variant="destructive"
      style={{ animation: "none" }}
    >
      <div className="grid gap-1">
        <ToastTitle>Failed to issue part</ToastTitle>
        <ToastDescription>
          Bosch front brake pads (PN BP-2210) are out of stock. Raise a parts
          requisition to continue.
        </ToastDescription>
      </div>
      <ToastAction altText="Raise requisition">Reorder</ToastAction>
      <ToastClose />
    </Toast>
    {/* The capture card wraps cells in a transformed container, so the
        default fixed-position viewport anchors offscreen — render it
        statically for the static preview. */}
    <ToastViewport style={{ position: "static", maxWidth: "100%" }} />
  </ToastProvider>
);
