import { EyeOffIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const LoginDashboard = (): JSX.Element => {
  // Form field data
  const formFields = [
    {
      id: "email",
      label: "Email",
      placeholder: "Enter your email address",
      type: "text",
    },
    {
      id: "password",
      label: "Password",
      placeholder: "Enter your Password",
      type: "password",
      hasIcon: true,
    },
  ];

  return (
    <main className="bg-transparent grid justify-items-center [align-items:start] w-screen min-h-screen h-full">
      <div className="bg-[linear-gradient(180deg,rgba(14,51,77,1)_0%,rgba(0,13,32,1)_100%)] w-full max-w-[1440px] h-[1210px] relative flex">
        {/* Left side with image */}
        <div className="relative w-[622px]">
          <img
            className="absolute w-[538px] h-[458px] top-[396px] left-[60px] object-cover"
            alt="Login illustration"
            src="/figmaAssets/image-1.png"
          />
        </div>

        {/* Right side with login form */}
        <Card className="flex flex-col w-[818px] h-full items-center justify-center gap-8 px-20 py-[92px] bg-[#fbfbfc] rounded-none border-none shadow-none">
          <CardContent className="flex flex-col w-full max-w-[594px] items-center p-0 space-y-8">
            {/* Header */}
            <div className="flex flex-col w-full items-start gap-2">
              <h1 className="relative self-stretch font-display-large-semibold font-semibold text-[#222029] text-[54px] text-center tracking-[-2.7px] leading-normal">
                Login
              </h1>
              <p className="relative self-stretch font-['Poppins',Helvetica] font-medium text-[#222029] text-xl text-center tracking-[0] leading-normal">
                Welcome again! type your email and password to access your
                account
              </p>
            </div>

            {/* Form */}
            <div className="flex flex-col w-full items-start gap-[21px] rounded-lg">
              <div className="flex flex-col items-start gap-6 w-full">
                <div className="flex flex-col items-start gap-5 w-full">
                  {/* Email field */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="font-['Poppins',Helvetica] font-medium text-[#222029] text-base leading-[22.4px]">
                      {formFields[0].label}
                    </label>
                    <Input
                      className="h-[60px] px-5 py-3.5 rounded-[10px] border border-solid border-[#e6e6e6] font-['Poppins',Helvetica] text-primary-400 text-base"
                      placeholder={formFields[0].placeholder}
                      type={formFields[0].type}
                    />
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="font-['Poppins',Helvetica] font-medium text-[#222029] text-base leading-[22.4px]">
                      {formFields[1].label}
                    </label>
                    <div className="flex h-[60px] items-center justify-between px-5 py-3.5 w-full rounded-[10px] border border-solid border-[#e6e6e6] relative">
                      <Input
                        className="border-0 p-0 h-full shadow-none font-['Poppins',Helvetica] font-normal text-[#999999] text-base"
                        placeholder={formFields[1].placeholder}
                        type={formFields[1].type}
                      />
                      <EyeOffIcon className="w-6 h-6 text-gray-500 absolute right-5" />
                    </div>
                  </div>

                  {/* Remember me and Forgot Password */}
                  <div className="flex items-center justify-between w-full">
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        className="w-[22px] h-[22px] rounded-sm"
                      />
                      <label
                        htmlFor="remember-me"
                        className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm"
                      >
                        Remember me
                      </label>
                    </div>
                    <a
                      href="#"
                      className="font-['Poppins',Helvetica] font-normal text-accent-500 text-sm text-right underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
              </div>

              {/* Login button */}
              <Button className="flex items-center justify-center gap-2.5 px-[84px] py-4 w-full bg-accent-500 rounded-lg text-[#fbfbfc] text-xl font-['Poppins',Helvetica] font-medium hover:bg-accent-500/90">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
