import { FileTreeData } from "vscode";
import { createProjectPreviewUri } from "./filesystemProvider";

interface ProjectNode {
	name: string;
	depth: number;
	parent: ProjectNode | undefined;
	children: ProjectNode[];
}

export type ProjectItem = { type: "file" | "folder"; path: string };

function calculateDepth(inputString: string): number {
	const index = inputString.indexOf('── ');
	const numChars = index - inputString.indexOf('\n', index) - 1;
	return numChars === - 1 ? 0 : numChars;
}

export function parseFileStructure(fileStructure: string): ProjectNode {
	const lines = fileStructure.trim().split('\n');
	const root: ProjectNode = { name: '', depth: 0, parent: undefined, children: [] };
	let prevNode = root;

	for (const line of lines) {

		const depth = calculateDepth(line);
		const index = line.lastIndexOf('── ');
		const name = index >= 0 ? line.substring(index + 3) : line;
		const node: ProjectNode = { name: name, depth: depth, parent: undefined, children: [] };

		if (depth === 0) {
			root.name = line;
			continue;
		}
		else if (prevNode.depth < depth) {
			node.parent = prevNode;
			prevNode.children.push(node);
		}
		else if (prevNode.depth === depth) {
			node.parent = prevNode.parent;
			prevNode.parent?.children.push(node);
		}
		else {
			// work back up till you find a sibling
			while (prevNode.depth !== depth && prevNode.parent) {
				prevNode = prevNode.parent;
			}
			node.parent = prevNode.parent;
			prevNode.parent?.children.push(node);
		}

		prevNode = node;
	}

	return root;
}

function hasExtensionRegex(filePath: string): boolean {
	return /\.[^/.]+$/.test(filePath);
}

export function convertToProjectItems(node: ProjectNode, currentPath: string = '', paths: ProjectItem[]): void {
	const newPath = currentPath === '' ? node.name : `${currentPath}/${node.name}`;
	paths.push({ type: node.children.length || !hasExtensionRegex(newPath) ? 'folder' : 'file', path: newPath });

	for (const child of node.children) {
		convertToProjectItems(child, newPath, paths);
	}
}

export function convertToInteractiveProgressFileTree(node: ProjectNode, currentPath: string = ''): FileTreeData {
	const newPath = currentPath === '' ? node.name : `${currentPath}/${node.name}`;
	const children: FileTreeData[] = [];
	const sortedChildren = node.children.sort((a, b) => {
		// Sort alphabetically amongst nodes of the same type
		if (a.children.length && b.children.length) {
			return a.name.localeCompare(b.name);
		}
		// Show folders, then files
		return a.children.length ? -1 : 1;
	});

	for (const child of sortedChildren) {
		children.push(convertToInteractiveProgressFileTree(child, newPath));
	}

	return { label: node.name, uri: createProjectPreviewUri(newPath), children: children.length || !hasExtensionRegex(newPath) ? children : undefined };
}
