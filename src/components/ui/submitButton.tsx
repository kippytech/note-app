import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";

type SubmitButtonProps = {
  loading: boolean;
} & ButtonProps;

function SubmitButton({ loading, children, ...props }: SubmitButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {children}
      {loading && <Loader2 className="mr-[2.5] h-4 w-4 animate-spin" />}
    </Button>
  );
}

export default SubmitButton;
