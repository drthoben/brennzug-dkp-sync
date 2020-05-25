import { Col, Row } from 'antd';
import React from 'react';


interface Props {
  children?: React.ReactNode,
}

const layout = {
  xs: {
    span: 24,
  },
  sm: {
    span: 24,
  },
  md: {
    span: 20,
    offset: 2,
  },
  lg: {
    span: 16,
    offset: 4,
  },
  xl: {
    span: 12,
    offset: 6,
  },
};

export function Layout(props: Props) {
  return (
    <Row>
      <Col{...layout}>
        {props.children}
      </Col>
    </Row>
  );
}
