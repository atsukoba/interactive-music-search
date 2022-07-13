declare module "react-scatter-board";

type Coordinate = {
  x: number;
  y: number;
  z: number;
};

type ScatterBoardProps = {
  /**
   * ([{x: 0, y: 0, z: 0, ...}]): the json formatted data
   */
  data: Array<Coordinate>;
  /**
   * (_string_): the key to shape the dots by default.
   */
  shapeKey: string;
  /**
   * (_string_): the key to color the dots by default.
   */
  colorKey: string;
  /**
   * (_Array_ of strings): the ordered list of keys of attributes to display for the dots when mouse hovers.
   */
  labelKeys: Array<string>;
  /**
   * (_Array_ of strings): the list of keys of attributes to enable the search functionality to query against. If not provided, the SearchSelectize component will not be rendered.
   */
  searchKeys: Array<string>;
  /**
   * (_number_): the width of the component in pixels. Default: 1400.
   */
  width: number;
  /**
   * (_number_): the height of the component in pixels. Default: 800.
   */
  height: number;
  /**
   * (_boolean_): should the scatter plot in 3-D (true) or 2-D (false).
   */
  is3d: bool;
  /**
   * (_function_): a callback function handling when user click a data point. The input of the function is mouse event and the datum object being clicked.
   */
  onClick: func;
  /**
   * (_function_): a callback function handling when user hovers over a data point. The input of the function is the datum object being clicked.
   */
  onMouseOver: func;

  /// DASH

  /**
   * The ID used to identify this component in Dash callbacks.
   */
  id: string;
  /**
   * Dash-assigned callback that should be called to report property changes
   * to Dash, to make them available for callbacks.
   */
  setProps: func;
};

declare class ScatterBoard extends React.Component {
  constructor(props: ScatterBoardProps): JSX.Element;
}

type LazyProps = {
  /**
   * A function returning a promise that resolves to a react element
   */
  children: func;
  /**
   * Loading indicator (node or react component)
   */
  loading: HTMLElement | JSX.Element;
};

declare class Lazy extends React.Component {
  constructor(props: LazyProps): JSX.Element;
}
