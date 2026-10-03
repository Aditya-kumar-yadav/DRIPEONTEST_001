import { Product } from '../types';

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  // Store product IDs that share this prefix path
  productIds: Set<string> = new Set();
}

export class ProductTrie {
  root: TrieNode = new TrieNode();
  productMap: Map<string, Product> = new Map();

  // Helper to safely split and tokenize text into searchable words
  private extractWords(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().split(/[\s\-_,]+/).filter(w => w.length > 0);
  }

  insert(product: Product) {
    this.productMap.set(product.id, product);
    
    // Extract words from all searchable fields
    const words = [
      ...this.extractWords(product.name),
      ...this.extractWords(product.category),
      ...this.extractWords(product.fabric || ''),
      ...this.extractWords(product.fit || ''),
      ...this.extractWords(product.styleType || '')
    ];

    // For every word, insert all prefixes into the Trie
    for (const word of words) {
      let node = this.root;
      for (const char of word) {
        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode());
        }
        node = node.children.get(char)!;
        node.productIds.add(product.id);
      }
    }
  }

  search(query: string): Product[] {
    const queryWords = this.extractWords(query);
    if (queryWords.length === 0) return [];

    let intersectedIds: Set<string> | null = null;

    // Search each word in the query and find intersection of product IDs
    for (const word of queryWords) {
      let node = this.root;
      let found = true;
      for (const char of word) {
        if (!node.children.has(char)) {
          found = false;
          break;
        }
        node = node.children.get(char)!;
      }

      // If any word in the query yields no results, the entire query has no matches
      if (!found) return []; 

      if (intersectedIds === null) {
        intersectedIds = new Set(node.productIds);
      } else {
        // Intersect current results with previous results
        const newIntersect = new Set<string>();
        for (const id of node.productIds) {
          if (intersectedIds.has(id)) {
            newIntersect.add(id);
          }
        }
        intersectedIds = newIntersect;
      }
      
      // Early exit if intersection is empty
      if (intersectedIds.size === 0) return []; 
    }

    return Array.from(intersectedIds || []).map(id => this.productMap.get(id)!);
  }
}
