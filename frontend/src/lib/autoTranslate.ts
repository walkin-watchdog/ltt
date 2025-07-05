const IGNORE = new Set([
  'SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT','CODE','PRE','META','TITLE','LINK'
]);

const SHOULD_SKIP = (el: HTMLElement) =>
  el.classList.contains('notranslate') || el.hasAttribute('data-no-translate');

function collectTextNodes(root: Node, acc: Text[]) {
  if (root.nodeType === Node.TEXT_NODE) {
    const value = root.nodeValue?.trim();
    if (value) acc.push(root as Text);
    return;
  }
  if (
    root.nodeType === Node.ELEMENT_NODE &&
    !IGNORE.has((root as HTMLElement).tagName) &&
    !SHOULD_SKIP(root as HTMLElement)
  ) {
    root.childNodes.forEach(n => collectTextNodes(n, acc));
  }
}

export async function translateDOM(root: HTMLElement, to: string, endpoint: string) {
  const textNodes: Text[] = [];
  collectTextNodes(root, textNodes);

  if (to === 'en') {
    textNodes.forEach(n => {
      const original = (n as any)._origText;
      if (original) n.data = original;
    });
    return;
  }

  textNodes.forEach(n => {
    if (!(n as any)._origText) (n as any)._origText = n.data;
  });

  const originals = [
    ...new Set(textNodes.map(t => (t as any)._origText as string))
  ];
  if (originals.length === 0) return;

  const resp = await fetch(`${endpoint}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: originals, to })
  });
  if (!resp.ok) {
    throw new Error('Translation fetch failed');
  }

  const { text: translated } = await resp.json() as { text: string[] };

  const map = new Map<string,string>();
  originals.forEach((src, i) => map.set(src, translated[i] ?? src));

  textNodes.forEach(node => {
    const newText = map.get(node.data);
    if (newText && newText !== node.data) node.data = newText;
  });
}

let observer: MutationObserver | null = null;
export function installObserver(to: string, endpoint: string) {
  if (observer) observer.disconnect();
  observer = new MutationObserver((muts) => {
    const added = muts.flatMap(m => Array.from(m.addedNodes));
    added.forEach(n => {
      if (n.nodeType === Node.TEXT_NODE || n.nodeType === Node.ELEMENT_NODE) {
        translateDOM(n as HTMLElement, to, endpoint).catch(console.error);
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}