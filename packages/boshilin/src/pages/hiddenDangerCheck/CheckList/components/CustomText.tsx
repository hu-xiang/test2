import React, { useRef, useEffect } from 'react';
// import React from 'react';
import { Text, Transformer } from 'react-konva';

interface Iprops {
  shapeProps?: any;
  isSelected?: boolean;
  onSelect?: () => void;
  onDblclick?: () => void;
  onChange?: Function;
  stageHandler?: any;
}

const Rectangle: React.FC<Iprops> = (props) => {
  const { shapeProps, isSelected, onSelect, onChange, stageHandler } = props;
  // const shapeRef = React.useRef();
  // const trRef = React.useRef();
  const shapeRef = useRef<any>();
  const trRef = useRef<any>();

  // 双击
  const handleDblclick = () => {
    // hide text node and transformer:
    shapeRef.current.hide();
    trRef.current.hide();

    // at first lets find position of text node relative to the stage:
    const textPosition = shapeRef.current.absolutePosition();
    const areaPosition = {
      x: stageHandler.container().offsetLeft + textPosition.x,
      y: stageHandler.container().offsetTop + textPosition.y,
    };

    // create textarea and style it
    const textarea: any = document.createElement('textarea');
    const stageNode = document.querySelector('.stageWrapper');
    stageNode?.appendChild(textarea);

    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = shapeRef.current.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${shapeRef.current.width() - shapeRef.current.padding() * 2}px`;
    textarea.style.height = `${shapeRef.current.height() - shapeRef.current.padding() * 2 + 5}px`;
    textarea.style.fontSize = `${shapeRef.current.fontSize()}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = shapeRef.current.lineHeight();
    textarea.style.fontFamily = shapeRef.current.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = shapeRef.current.align();
    textarea.style.color = shapeRef.current.fill();
    textarea.style.zIndex = 100;
    const rotation = shapeRef.current.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }

    let px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(shapeRef.current.fontSize() / 20);
    }
    transform += `translateY(-${px}px)}`;

    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = `${textarea.scrollHeight + 3}px`;

    textarea.focus();

    function removeTextarea() {
      // textarea.parentNode.removeChild(textarea);
      const textareaNode = document.querySelector('textarea');
      textareaNode?.parentNode?.removeChild(textareaNode);
      window.removeEventListener('click', handleOutsideClick);
      shapeRef?.current?.show();
    }

    function setTextareaWidth(newWidth?: any) {
      let newWidthRes = newWidth;
      if (!newWidth) {
        // set width for placeholder
        newWidthRes = shapeRef.current.placeholder.length * shapeRef.current.fontSize();
      }
      // some extra fixes on different browsers
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      // let isFirefox =
      //   navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

      if (isSafari || isFirefox) {
        newWidthRes = Math.ceil(newWidth);
      }

      const isEdge = document?.DOCUMENT_NODE || /Edge/.test(navigator.userAgent);
      if (isEdge) {
        newWidthRes = newWidth + 1;
      }
      textarea.style.width = `${newWidthRes}px`;
    }

    textarea.addEventListener('keydown', (e: any) => {
      // hide on enter
      // but don't hide on shift + enter
      if (e.keyCode === 13 && !e.shiftKey) {
        shapeRef.current.text(textarea.value);
        removeTextarea();
      }
      // on esc do not set value back to node
      if (e.keyCode === 27) {
        removeTextarea();
      }
      const scale = shapeRef.current.getAbsoluteScale().x;
      setTextareaWidth(shapeRef.current.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + shapeRef.current.fontSize()}px`;
    });

    function handleOutsideClick(e: any) {
      // 判断点击textarea区域外
      if (e.target !== textarea) {
        shapeRef?.current?.text(textarea.value);
        onChange({ ...shapeProps, text: textarea.value });
        removeTextarea();
      }
    }
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        onDblclick={() => {
          handleDblclick();
        }}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e: any) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const rotation = node.rotation();
          // const fontSize = node.fontSize() * Math.max(scaleX, scaleY);
          const fontSize = node.fontSize() * node.scaleX();
          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation,
            fontSize,
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Rectangle;
