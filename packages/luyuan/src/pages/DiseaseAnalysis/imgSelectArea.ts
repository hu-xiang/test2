const mouseInfo = {
  offsetX: 0,
  offsetY: 0,
};
let div: HTMLDivElement;
let mouseDown = false;
export function getImgInfo(event: Event) {
  mouseDown = true;
  const tempDiv = event.target.parentNode.querySelector('.tempDiv');
  console.log(tempDiv);
  if (tempDiv) {
    tempDiv.parentNode.removeChild(tempDiv);
  }
  mouseInfo.offsetX = event.offsetX;
  mouseInfo.offsetY = event.offsetY;
  div = document.createElement('div');
  div.setAttribute('class', 'tempDiv');
  div.style.top = `${event.offsetY}px`;
  div.style.left = `${event.offsetX}px`;
  event.target.parentNode.appendChild(div);
  event.target?.addEventListener('mousemove', handleSelected);
}

export function handleSelected(event: Event) {
  // console.log(mouseDown)
  if (div && mouseDown) {
    const nowOffsetX = event.offsetX;
    const nowOffsetY = event.offsetY;
    div.style.left = `${Math.min(nowOffsetX, mouseInfo.offsetX)}px`;
    div.style.top = `${Math.min(nowOffsetY, mouseInfo.offsetY)}px`;
    div.style.width = `${Math.abs(nowOffsetX - mouseInfo.offsetX)}px`;
    div.style.height = `${Math.abs(nowOffsetY - mouseInfo.offsetY)}px`;

    event.target?.addEventListener('mouseup', endSelected);
  }
}

export function endSelected(event: Event) {
  mouseDown = false;
  event.target?.removeEventListener('mousemove', handleSelected);
  event.target?.removeEventListener('mouseup', endSelected);
}
