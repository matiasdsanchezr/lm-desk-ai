import {
  TextNode,
  type EditorConfig,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
} from "lexical"

export type SerializedMentionNode = Spread<
  {
    filePath: string
    mentionName: string
  },
  SerializedTextNode
>

export class MentionNode extends TextNode {
  __filePath: string
  __mentionName: string

  static override getType(): string {
    return "mention"
  }

  static override clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mentionName, node.__filePath, node.__key)
  }

  constructor(mentionName: string, filePath: string, key?: NodeKey) {
    super(`@${mentionName}`, key)
    this.__filePath = filePath
    this.__mentionName = mentionName
    this.__mode = 1 // Token mode (se comporta como un único carácter al borrar)
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    dom.className =
      "font-mono font-semibold text-blue-500 dark:text-blue-400 bg-primary/10 px-1.5 py-0.5 rounded-md inline-block align-baseline decoration-stretch select-all"
    return dom
  }

  override updateDOM(
    prevNode: this,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    const isChanged = super.updateDOM(prevNode, dom, config)
    if (isChanged) {
      dom.className =
        "font-mono font-semibold text-blue-500 dark:text-blue-400 bg-primary/10 px-1.5 py-0.5 rounded-md inline-block align-baseline decoration-stretch select-all"
    }
    return isChanged
  }

  override isTextEntity(): boolean {
    return true
  }

  override exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      filePath: this.__filePath,
      mentionName: this.__mentionName,
      type: "mention",
      version: 1,
    }
  }

  static override importJSON(
    serializedNode: SerializedMentionNode
  ): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionName,
      serializedNode.filePath
    )
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }
}

export function $createMentionNode(
  mentionName: string,
  filePath: string
): MentionNode {
  const mentionNode = new MentionNode(mentionName, filePath)
  mentionNode.setMode("token")
  return mentionNode
}

export function $isMentionNode(node: unknown): node is MentionNode {
  return node instanceof MentionNode
}
