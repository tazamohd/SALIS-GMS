import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
} from "rest-express";

export const Default = () => (
  <div className="space-y-2 p-4">
    <Label htmlFor="otp-pickup">Vehicle pickup code</Label>
    <InputOTP id="otp-pickup" maxLength={6} value="" readOnly>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
    <p className="text-xs text-muted-foreground">
      Sent by SMS to the registered owner.
    </p>
  </div>
);

export const Filled = () => (
  <div className="space-y-2 p-4">
    <Label htmlFor="otp-filled">Confirmation code</Label>
    <InputOTP id="otp-filled" maxLength={6} value="492716" readOnly>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  </div>
);

export const WithSeparator = () => (
  <div className="space-y-2 p-4">
    <Label htmlFor="otp-sep">Gate release PIN</Label>
    <InputOTP id="otp-sep" maxLength={6} value="830"
      readOnly>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  </div>
);

export const Disabled = () => (
  <div className="space-y-2 p-4">
    <Label htmlFor="otp-disabled">Pickup code (expired)</Label>
    <InputOTP id="otp-disabled" maxLength={4} value="71" readOnly disabled>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
    <p className="text-xs text-muted-foreground">
      Request a new code from the service desk.
    </p>
  </div>
);
