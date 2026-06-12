import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { TransactionApi } from '../../entities/transaction/api/transaction.api';
import { CategoryTag } from '../../shared/ui/category-tag';
import { SpendingFilter } from '../../features/spending-filter/spending-filter';
import { Transaction, Category } from '../../shared/model/types';

@Component({
  selector: 'page-transactions',
  standalone: true,
  imports: [CommonModule, CategoryTag, SpendingFilter],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsPage implements OnInit {
  private txApi = inject(TransactionApi);

  allTx: Transaction[] = [];
  loading = true;
  selectedCategory: Category | '전체' = '전체';
  page = 1;
  readonly PAGE_SIZE = 15;

  ngOnInit() {
    this.txApi.getTransactions().subscribe(res => {
      this.allTx = res;
      this.loading = false;
      setTimeout(() => this.runEntryAnimations(), 60);
    });
  }

  private runEntryAnimations() {
    gsap.set('.page-header, .summary-bar, .card-block, .tx-row', { opacity: 0, y: 16 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.page-header',  { opacity: 1, y: 0, duration: 0.4 })
      .to('.summary-bar',  { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
      .to('.card-block',   { opacity: 1, y: 0, duration: 0.4 }, '-=0.15')
      .to('.tx-row',       { opacity: 1, y: 0, duration: 0.25, stagger: 0.04 }, '-=0.3');
  }

  animateNewRows() {
    const newRows = document.querySelectorAll('.tx-row');
    const start = (this.page - 1) * this.PAGE_SIZE;
    const toAnimate = Array.from(newRows).slice(start);
    gsap.fromTo(toAnimate, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' });
  }

  get filtered(): Transaction[] {
    return this.selectedCategory === '전체'
      ? this.allTx
      : this.allTx.filter(t => t.category === this.selectedCategory);
  }

  get paged(): Transaction[] {
    return this.filtered.slice(0, this.page * this.PAGE_SIZE);
  }

  get hasMore(): boolean { return this.paged.length < this.filtered.length; }

  get totalFiltered(): number { return this.filtered.reduce((s, t) => s + t.amount, 0); }

  onCategorySelect(cat: Category | '전체') {
    this.selectedCategory = cat;
    this.page = 1;
    setTimeout(() => {
      gsap.fromTo('.tx-row', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.25, stagger: 0.04, ease: 'power3.out' });
    }, 20);
  }

  loadMore() {
    this.page = this.page + 1;
    setTimeout(() => this.animateNewRows(), 20);
  }
}
