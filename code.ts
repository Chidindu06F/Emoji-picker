// Emoji Picker plugin main code
// Shows UI and inserts selected emoji into current selection

figma.showUI(__html__, { width: 420, height: 520 });

type InsertEmojiMessage = {
  type: "insert-emoji";
  payload: { emoji: string };
};

type RequestEmojiImageMessage = {
  type: "request-emoji-image";
  payload: { emoji: string };
};

type AddRecentMessage = {
  type: "add-recent";
  payload: { emoji: string };
};

type GetRecentsMessage = { type: "get-recents" };

figma.ui.onmessage = async (
  msg:
    | InsertEmojiMessage
    | RequestEmojiImageMessage
    | AddRecentMessage
    | GetRecentsMessage
    | { type: "close" }
) => {
  if (msg.type === "insert-emoji") {
    const emoji = msg.payload.emoji;
    try {
      // Attempt to load a common emoji-capable font. If unavailable, fallback to default
      // Load a generic font that exists in Figma. Emoji glyphs will render when supported by the system.
      await figma
        .loadFontAsync({ family: "Inter", style: "Regular" })
        .catch(() => undefined);

      const selection = figma.currentPage.selection;
      let targetTextNode: TextNode | null = null;

      if (selection.length === 1 && selection[0].type === "TEXT") {
        targetTextNode = selection[0] as TextNode;
        // Ensure font for existing text range is loaded; best effort
        const fontNames = targetTextNode.getRangeAllFontNames(
          0,
          targetTextNode.characters.length
        );
        for (const fontName of fontNames) {
          try {
            await figma.loadFontAsync(fontName);
          } catch {
            /* ignore */
          }
        }
      }

      if (!targetTextNode) {
        // Create a new text node at viewport center
        targetTextNode = figma.createText();
        targetTextNode.characters = emoji;
        figma.currentPage.appendChild(targetTextNode);
        const center = figma.viewport.center;
        targetTextNode.x = center.x;
        targetTextNode.y = center.y;
        figma.currentPage.selection = [targetTextNode];
        figma.notify("Inserted emoji");
        return;
      }

      // Insert emoji at end of existing text or replace selection
      const insertAt = targetTextNode.characters.length;
      targetTextNode.insertCharacters(insertAt, emoji);
      figma.notify("Inserted emoji");
    } catch (err) {
      figma.notify("Failed to insert emoji");
    }
    return;
  }

  if (msg.type === "request-emoji-image") {
    const emoji = msg.payload.emoji;
    try {
      await figma
        .loadFontAsync({ family: "Inter", style: "Regular" })
        .catch(() => undefined);
      const t = figma.createText();
      try {
        t.fontName = { family: "Inter", style: "Regular" };
      } catch {}
      try {
        t.fontSize = 64;
      } catch {}
      t.characters = emoji;
      figma.currentPage.appendChild(t);
      const bytes = await t.exportAsync({ format: "PNG" });
      // Send raw bytes; UI will construct a blob URL
      figma.ui.postMessage({ type: "emoji-image", payload: { emoji, bytes } });
      t.remove();
    } catch {
      // Ignore
    }
    return;
  }

  if (msg.type === "add-recent") {
    const emoji = msg.payload.emoji;
    try {
      const key = "emojiPickerRecents";
      const existing = (await figma.clientStorage.getAsync(key)) as
        | string[]
        | undefined;
      const list = Array.isArray(existing) ? existing : [];
      const filtered = list.filter((e) => e !== emoji);
      filtered.unshift(emoji);
      const next = filtered.slice(0, 8);
      await figma.clientStorage.setAsync(key, next);
      figma.ui.postMessage({ type: "recents", payload: next });
    } catch {
      // ignore
    }
    return;
  }

  if (msg.type === "get-recents") {
    try {
      const key = "emojiPickerRecents";
      const existing = (await figma.clientStorage.getAsync(key)) as
        | string[]
        | undefined;
      figma.ui.postMessage({
        type: "recents",
        payload: Array.isArray(existing) ? existing : [],
      });
    } catch {
      figma.ui.postMessage({ type: "recents", payload: [] });
    }
    return;
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
