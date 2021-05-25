import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

type Updater<T> = (value: T) => T;
class Writable<T> extends BehaviorSubject<T> {
	set = this.next;
	update = (updater: Updater<T>) => {
		this.next(updater(this.value));
	};
}
type Stores = Observable<any> | [Observable<any>, ...Array<Observable<any>>];
type StoresValues<T> = T extends Observable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Observable<infer U> ? U : never;
	  };

export function writable<T>(value: T) {
	return new Writable(value);
}

export function get<T>(store: Observable<T>) {
	let value = undefined as any as T;
	store.subscribe((storeVal) => (value = storeVal)).unsubscribe();
	return value;
}

export function derived<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T
): Observable<T> {
	return combineLatest(stores).pipe(map(fn), distinctUntilChanged());
}
