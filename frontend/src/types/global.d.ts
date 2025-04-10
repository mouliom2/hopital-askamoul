declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
  };
}

declare module '@/components/*' {
  const component: React.ComponentType<any>;
  export default component;
}
