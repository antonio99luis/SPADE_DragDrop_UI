import './NodeHeader.css';

export default function NodeHeader({image, title}) {

  return (
    <div
      className={'node-header'}
      style={{ position: 'relative' }}
    >
      <div className="node-header-header">
        <img src={image} alt="" className="node-header-img" />
        <span className="node-header-title">{title}</span>
      </div>
    </div>
  );
}