import './NodeBaseToolBar.css';

export default function BaseNode({ image, title, selected}) {

  return (
    <div
      className={`base-node${selected ? ' base-node-selected' : ''}`}
      style={{ position: 'relative' }}
    >
      <div className="base-node-header">
        <img src={image} alt="" className="node-header-img" />
        <span className="base-node-title">{title}</span>
      </div>
    </div>
  );
}