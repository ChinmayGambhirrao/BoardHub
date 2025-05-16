import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const VIRTUALIZATION_CONFIG = {
  itemSize: 100, // Approximate height of a card
  overscan: 5,
};

export default function VirtualizedList({ items, renderItem }) {
  const Row = ({ index, style }) => {
    const item = items[index];
    return <div style={style}>{renderItem(item, index)}</div>;
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={VIRTUALIZATION_CONFIG.itemSize}
          overscanCount={VIRTUALIZATION_CONFIG.overscan}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
