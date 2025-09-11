import './NodeDivider.css';

export default function NodeDivider({title}) {

  return (
    <div
      className={'node-divider'}
      style={{ position: 'relative' }}
    >
      {title}
    </div>
  );
}