import * as React from "react";

// Simplified toast hook without type issues
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ToastProps = {
  message: string;
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 1),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: any) => void> = [];
let memoryState: any = { toasts: [] };

function dispatch(action: any) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export const toast = (props: ToastProps) => {
  const id = genId();
  
  const update = () => {};
  const dismiss = () => {};

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true },
  });

  return {
    id,
    dismiss,
    update,
  };
};

export const useToast = () => {
  const [state, setState] = React.useState(memoryState);
  
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return state;
};