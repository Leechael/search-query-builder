import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  title?: string;
  children: React.ReactElement;
  skipWrapper?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ 
  title, 
  children, 
  skipWrapper = false, 
  placement = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;
      
      switch (placement) {
        case 'top':
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          y = triggerRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          y = triggerRect.bottom + 8;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8;
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
      }
      
      setPosition({ x, y });
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    if (title) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (title) {
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  if (!title) {
    return children;
  }

  const wrappedChildren = React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      // Preserve any existing ref
      if (typeof children.ref === 'function') {
        children.ref(node);
      } else if (children.ref) {
        children.ref.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      children.props.onBlur?.(e);
    },
  });

  return (
    <>
      {wrappedChildren}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {title}
        </div>
      )}
    </>
  );
}