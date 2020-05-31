import React from 'react';


interface Props {
  children: React.ReactNode,
}

export function Block(props: Props) {
  return (
    <div className="component-block">
      {props.children}
    </div>
  );
}
