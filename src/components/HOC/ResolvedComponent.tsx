import { AxiosError } from "axios";
import React from "react";
import { Model } from "react3l-common";
import { Observable } from "rxjs";
type Component = typeof React.Component | ((props?: unknown) => JSX.Element);

export const withRouteResolver = <P extends object, T extends Model>(
  WrappedComponent: Component,
  resolver: () => Observable<T>,
  FallbackComponent: Component
) => {
  const ResolvedComponent = (props: P) => {
    const [resolvedData, setResolvedData] = React.useState<T>(null);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const subscription = resolver().subscribe({
        next: (data: T) => {
          if (data) {
            setResolvedData(data);
          }
        },
        error: (error: AxiosError) => {
          setError(error);
        },
      });
      return () => {
        subscription.unsubscribe();
      };
    }, []);

    return (
      <>
        {resolvedData && (
          <WrappedComponent {...props} resolvedData={resolvedData} />
        )}
        {!resolvedData && !error && <FallbackComponent />}
        {error && <div>Failed to load data: {error.message}</div>}
      </>
    );
  };

  return ResolvedComponent;
};
