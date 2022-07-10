import { FC } from "react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div>
      <p>Error Message</p>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};
