import React, { useEffect, useRef, useState } from 'react';
import type { SlashCommandItem } from '../slash-command';

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: any; // the Tiptap suggestion's main command
  editor: any;
  range: { from: number; to: number };
  onSelect: (itemCommand: Function) => void; // our new callback from slash-command extension
}

export function SlashCommandList(props: SlashCommandListProps) {
  const { items, editor, range, onSelect } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter'];
    const onKeyDown = (e: KeyboardEvent) => {
      if (!navigationKeys.includes(e.key)) {
        return;
      }

      e.preventDefault();

      if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : items.length - 1;
          scrollSelectedIntoView(newIndex);
          return newIndex;
        });
        return;
      }

      if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) => {
          const newIndex = prev < items.length - 1 ? prev + 1 : 0;
          scrollSelectedIntoView(newIndex);
          return newIndex;
        });
        return;
      }

      if (e.key === 'Enter' && items[selectedIndex]) {
        selectItem(items[selectedIndex]);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [items, selectedIndex]);

  const scrollSelectedIntoView = (index: number) => {
    if (!commandListRef.current) return;
    const element = commandListRef.current.children[index] as HTMLElement;
    if (!element) return;

    const containerHeight = commandListRef.current.clientHeight;
    const elementTop = element.offsetTop;
    const elementHeight = element.offsetHeight;
    const scrollTop = commandListRef.current.scrollTop;

    if (elementTop < scrollTop) {
      // Scroll up if element is above visible area
      commandListRef.current.scrollTop = elementTop;
    } else if (elementTop + elementHeight > scrollTop + containerHeight) {
      // Scroll down if element is below visible area
      commandListRef.current.scrollTop =
        elementTop + elementHeight - containerHeight;
    }
  };

  const selectItem = (item: SlashCommandItem) => {
    onSelect(item.command);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  if (!items.length) {
    return <div className="p-2 text-sm text-gray-400">No results</div>;
  }

  return (
    <div
      id="slash-command"
      ref={commandListRef}
      className="flex flex-col rounded-lg border bg-white text-black shadow-md w-64 overflow-hidden max-h-96 p-1 overflow-y-scroll"
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => selectItem(item)}
          className={`flex items-center gap-3 p-2 text-left rounded-lg hover:bg-gray-100 ${
            i === selectedIndex ? 'bg-gray-50' : ''
          }`}
          aria-selected={i === selectedIndex}
          tabIndex={i === selectedIndex ? 0 : -1}
        >
          <div className="h-5 w-5">{item.icon}</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-xs text-gray-400">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export const handleSlashCommandNavigation = (event: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
    const slashCommand = document.querySelector('#slash-command');
    if (slashCommand) {
      return true;
    }
  }
};
