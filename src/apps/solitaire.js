// Classic Klondike Solitaire
export class SolitaireGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onMoveChange = options.onMoveChange || (() => {});
    this.onWin = options.onWin || (() => {});

    this.cardWidth = 60;
    this.cardHeight = 85;
    this.padding = 15;
    this.stackOffset = 20;

    this.dragging = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.setupEventListeners();
    this.newGame();
  }

  newGame() {
    this.moves = 0;
    this.won = false;
    this.deck = this.createDeck();
    this.shuffle(this.deck);

    // Initialize piles
    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []]; // 4 foundation piles
    this.tableau = [[], [], [], [], [], [], []]; // 7 tableau columns

    // Deal cards to tableau
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = this.deck.pop();
        card.faceUp = row === col;
        this.tableau[col].push(card);
      }
    }

    // Rest goes to stock
    this.stock = this.deck.map(card => ({ ...card, faceUp: false }));
    this.deck = [];

    this.onMoveChange(0);
    this.draw();
  }

  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const deck = [];

    for (const suit of suits) {
      for (let value = 1; value <= 13; value++) {
        deck.push({
          suit,
          value,
          faceUp: false,
          color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black'
        });
      }
    }

    return deck;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getCardLabel(card) {
    const labels = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return labels[card.value];
  }

  getSuitSymbol(suit) {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[suit];
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // Get positions for all piles
  getStockPos() {
    return { x: this.padding, y: this.padding };
  }

  getWastePos() {
    return { x: this.padding + this.cardWidth + this.padding, y: this.padding };
  }

  getFoundationPos(index) {
    return {
      x: this.padding + (this.cardWidth + this.padding) * (3 + index),
      y: this.padding
    };
  }

  getTableauPos(col) {
    return {
      x: this.padding + (this.cardWidth + this.padding) * col,
      y: this.padding + this.cardHeight + this.padding + 10
    };
  }

  handleMouseDown(e) {
    if (this.won) return;

    const pos = this.getMousePos(e);

    // Check stock click
    const stockPos = this.getStockPos();
    if (this.isInCard(pos, stockPos)) {
      this.drawFromStock();
      return;
    }

    // Check waste pile for dragging
    const wastePos = this.getWastePos();
    if (this.waste.length > 0 && this.isInCard(pos, wastePos)) {
      this.dragging = {
        source: 'waste',
        cards: [this.waste[this.waste.length - 1]],
        sourceIndex: null
      };
      this.dragOffsetX = pos.x - wastePos.x;
      this.dragOffsetY = pos.y - wastePos.y;
      return;
    }

    // Check tableau for dragging
    for (let col = 0; col < 7; col++) {
      const pile = this.tableau[col];
      const basePos = this.getTableauPos(col);

      for (let i = pile.length - 1; i >= 0; i--) {
        const card = pile[i];
        if (!card.faceUp) continue;

        const cardY = basePos.y + i * this.stackOffset;
        const cardPos = { x: basePos.x, y: cardY };

        if (this.isInCard(pos, cardPos)) {
          this.dragging = {
            source: 'tableau',
            sourceIndex: col,
            cardIndex: i,
            cards: pile.slice(i)
          };
          this.dragOffsetX = pos.x - cardPos.x;
          this.dragOffsetY = pos.y - cardPos.y;
          return;
        }
      }
    }

    // Check foundations for dragging
    for (let i = 0; i < 4; i++) {
      const pile = this.foundations[i];
      if (pile.length === 0) continue;

      const foundationPos = this.getFoundationPos(i);
      if (this.isInCard(pos, foundationPos)) {
        this.dragging = {
          source: 'foundation',
          sourceIndex: i,
          cards: [pile[pile.length - 1]]
        };
        this.dragOffsetX = pos.x - foundationPos.x;
        this.dragOffsetY = pos.y - foundationPos.y;
        return;
      }
    }
  }

  handleMouseMove(e) {
    if (!this.dragging) return;

    const pos = this.getMousePos(e);
    this.dragging.x = pos.x - this.dragOffsetX;
    this.dragging.y = pos.y - this.dragOffsetY;
    this.draw();
  }

  handleMouseUp(e) {
    if (!this.dragging) return;

    const pos = this.getMousePos(e);
    let moved = false;

    // Try to drop on foundation
    for (let i = 0; i < 4; i++) {
      const foundationPos = this.getFoundationPos(i);
      if (this.isInCard(pos, foundationPos)) {
        if (this.canMoveToFoundation(this.dragging.cards[0], i) && this.dragging.cards.length === 1) {
          this.moveToFoundation(this.dragging, i);
          moved = true;
          break;
        }
      }
    }

    // Try to drop on tableau
    if (!moved) {
      for (let col = 0; col < 7; col++) {
        const basePos = this.getTableauPos(col);
        const pile = this.tableau[col];
        const dropY = basePos.y + (pile.length > 0 ? pile.length * this.stackOffset : 0);

        if (pos.x >= basePos.x && pos.x <= basePos.x + this.cardWidth &&
            pos.y >= basePos.y && pos.y <= dropY + this.cardHeight) {
          if (this.canMoveToTableau(this.dragging.cards[0], col)) {
            this.moveToTableau(this.dragging, col);
            moved = true;
            break;
          }
        }
      }
    }

    this.dragging = null;
    this.draw();

    if (moved) {
      this.checkWin();
    }
  }

  handleDoubleClick(e) {
    if (this.won) return;

    const pos = this.getMousePos(e);

    // Check waste pile
    const wastePos = this.getWastePos();
    if (this.waste.length > 0 && this.isInCard(pos, wastePos)) {
      this.autoMoveToFoundation(this.waste[this.waste.length - 1], 'waste', null);
      return;
    }

    // Check tableau
    for (let col = 0; col < 7; col++) {
      const pile = this.tableau[col];
      if (pile.length === 0) continue;

      const basePos = this.getTableauPos(col);
      const cardY = basePos.y + (pile.length - 1) * this.stackOffset;

      if (this.isInCard(pos, { x: basePos.x, y: cardY })) {
        const card = pile[pile.length - 1];
        if (card.faceUp) {
          this.autoMoveToFoundation(card, 'tableau', col);
        }
        return;
      }
    }
  }

  autoMoveToFoundation(card, source, sourceIndex) {
    for (let i = 0; i < 4; i++) {
      if (this.canMoveToFoundation(card, i)) {
        this.moveToFoundation({
          source,
          sourceIndex,
          cards: [card],
          cardIndex: source === 'tableau' ? this.tableau[sourceIndex].length - 1 : null
        }, i);
        this.draw();
        this.checkWin();
        return;
      }
    }
  }

  isInCard(pos, cardPos) {
    return pos.x >= cardPos.x && pos.x <= cardPos.x + this.cardWidth &&
           pos.y >= cardPos.y && pos.y <= cardPos.y + this.cardHeight;
  }

  drawFromStock() {
    if (this.stock.length > 0) {
      const card = this.stock.pop();
      card.faceUp = true;
      this.waste.push(card);
    } else if (this.waste.length > 0) {
      // Recycle waste pile
      this.stock = this.waste.reverse().map(card => ({ ...card, faceUp: false }));
      this.waste = [];
    }
    this.moves++;
    this.onMoveChange(this.moves);
    this.draw();
  }

  canMoveToFoundation(card, foundationIndex) {
    const pile = this.foundations[foundationIndex];

    if (pile.length === 0) {
      return card.value === 1; // Only aces
    }

    const topCard = pile[pile.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  }

  canMoveToTableau(card, col) {
    const pile = this.tableau[col];

    if (pile.length === 0) {
      return card.value === 13; // Only kings
    }

    const topCard = pile[pile.length - 1];
    return card.color !== topCard.color && card.value === topCard.value - 1;
  }

  moveToFoundation(drag, foundationIndex) {
    // Remove card from source
    if (drag.source === 'waste') {
      this.waste.pop();
    } else if (drag.source === 'tableau') {
      this.tableau[drag.sourceIndex].pop();
      this.flipTopCard(drag.sourceIndex);
    } else if (drag.source === 'foundation') {
      this.foundations[drag.sourceIndex].pop();
    }

    // Add to foundation
    this.foundations[foundationIndex].push(drag.cards[0]);
    this.moves++;
    this.onMoveChange(this.moves);
  }

  moveToTableau(drag, col) {
    // Remove cards from source
    if (drag.source === 'waste') {
      this.waste.pop();
    } else if (drag.source === 'tableau') {
      this.tableau[drag.sourceIndex].splice(drag.cardIndex);
      this.flipTopCard(drag.sourceIndex);
    } else if (drag.source === 'foundation') {
      this.foundations[drag.sourceIndex].pop();
    }

    // Add to tableau
    this.tableau[col].push(...drag.cards);
    this.moves++;
    this.onMoveChange(this.moves);
  }

  flipTopCard(col) {
    const pile = this.tableau[col];
    if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
      pile[pile.length - 1].faceUp = true;
    }
  }

  checkWin() {
    const totalFoundation = this.foundations.reduce((sum, pile) => sum + pile.length, 0);
    if (totalFoundation === 52) {
      this.won = true;
      this.onWin(this.moves);
    }
  }

  draw() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#0a5c36';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stock pile
    const stockPos = this.getStockPos();
    if (this.stock.length > 0) {
      this.drawCardBack(stockPos.x, stockPos.y);
    } else {
      this.drawEmptyPile(stockPos.x, stockPos.y);
    }

    // Draw waste pile
    const wastePos = this.getWastePos();
    if (this.waste.length > 0) {
      const topCard = this.waste[this.waste.length - 1];
      if (!this.dragging || this.dragging.source !== 'waste') {
        this.drawCard(topCard, wastePos.x, wastePos.y);
      }
    }

    // Draw foundations
    for (let i = 0; i < 4; i++) {
      const pos = this.getFoundationPos(i);
      const pile = this.foundations[i];

      if (pile.length > 0) {
        const skipLast = this.dragging && this.dragging.source === 'foundation' && this.dragging.sourceIndex === i;
        const topIndex = skipLast ? pile.length - 2 : pile.length - 1;
        if (topIndex >= 0) {
          this.drawCard(pile[topIndex], pos.x, pos.y);
        } else {
          this.drawFoundationPile(pos.x, pos.y, i);
        }
      } else {
        this.drawFoundationPile(pos.x, pos.y, i);
      }
    }

    // Draw tableau
    for (let col = 0; col < 7; col++) {
      const basePos = this.getTableauPos(col);
      const pile = this.tableau[col];

      if (pile.length === 0) {
        this.drawEmptyPile(basePos.x, basePos.y);
      } else {
        let endIndex = pile.length;
        if (this.dragging && this.dragging.source === 'tableau' && this.dragging.sourceIndex === col) {
          endIndex = this.dragging.cardIndex;
        }

        for (let i = 0; i < endIndex; i++) {
          const card = pile[i];
          const y = basePos.y + i * this.stackOffset;
          if (card.faceUp) {
            this.drawCard(card, basePos.x, y);
          } else {
            this.drawCardBack(basePos.x, y);
          }
        }
      }
    }

    // Draw dragged cards
    if (this.dragging && this.dragging.x !== undefined) {
      this.dragging.cards.forEach((card, i) => {
        this.drawCard(card, this.dragging.x, this.dragging.y + i * this.stackOffset);
      });
    }

    // Draw win message
    if (this.won) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 36px "Pixelated MS Sans Serif", Arial';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 20);

      ctx.fillStyle = '#fff';
      ctx.font = '18px "Pixelated MS Sans Serif", Arial';
      ctx.fillText(`Moves: ${this.moves}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  drawCard(card, x, y) {
    const ctx = this.ctx;

    // Card background
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(x, y, this.cardWidth, this.cardHeight, 4);
    ctx.fill();

    // Card border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Card content
    ctx.fillStyle = card.color === 'red' ? '#c00' : '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';

    const label = this.getCardLabel(card);
    const symbol = this.getSuitSymbol(card.suit);

    // Top left
    ctx.fillText(label, x + 5, y + 16);
    ctx.font = '12px Arial';
    ctx.fillText(symbol, x + 5, y + 28);

    // Center symbol
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(symbol, x + this.cardWidth / 2, y + this.cardHeight / 2 + 8);

    // Bottom right (upside down)
    ctx.save();
    ctx.translate(x + this.cardWidth - 5, y + this.cardHeight - 5);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, 0, 11);
    ctx.font = '12px Arial';
    ctx.fillText(symbol, 0, 23);
    ctx.restore();
  }

  drawCardBack(x, y) {
    const ctx = this.ctx;

    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(x, y, this.cardWidth, this.cardHeight, 4);
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, this.cardWidth - 8, this.cardHeight - 8, 2);
    ctx.stroke();

    // Pattern
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.arc(x + 15 + i * 15, y + 18 + j * 18, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawEmptyPile(x, y) {
    const ctx = this.ctx;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.roundRect(x, y, this.cardWidth, this.cardHeight, 4);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawFoundationPile(x, y, index) {
    const ctx = this.ctx;
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const symbol = this.getSuitSymbol(suits[index]);
    const color = index < 2 ? '#c00' : '#000';

    this.drawEmptyPile(x, y);

    ctx.fillStyle = `rgba(${index < 2 ? '200, 0, 0' : '0, 0, 0'}, 0.3)`;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(symbol, x + this.cardWidth / 2, y + this.cardHeight / 2 + 10);
  }

  restart() {
    this.newGame();
  }
}
