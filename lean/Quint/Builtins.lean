module

public import Veil

/-! The meaning of Quint's builtin operators, as Lean definitions.

This is the semantic half of the embedding: `Quint.Embed` maps every builtin opcode of the Quint IR to
one definition here, so what a Quint spec means in Lean is what these definitions say. The reference is
`quint/src/builtin.qnt`, with the simulator (`quint/src/runtime/impl/builtins.ts`) and the Rust evaluator
(`crates/evaluator/src/builtins.rs`) as the executable ones.

A Quint set is a `Std.ExtTreeSet` and a Quint map a `Std.ExtTreeMap`: both are extensional, so Lean's `=`
on them is the equality Quint uses, and both execute, which is what lets Veil's model checker run a spec.
Neither Quint evaluator keeps its sets ordered, so the embedding agrees with them on every observable
result except the order `fold` visits elements in, which Quint leaves unspecified. -/

@[expose] public section

namespace Quint

/-- A Quint `Set[α]`. -/
abbrev Set (α : Type) [Ord α] := Std.ExtTreeSet α

/-- A Quint map `κ -> ν`. -/
abbrev Map (κ ν : Type) [Ord κ] := Std.ExtTreeMap κ ν

/-- What a Quint set needs of its elements: an order to store them by that equality agrees with. -/
abbrev Ordered (α : Type) [Ord α] :=
  Std.TransCmp (compare : α → α → Ordering) ∧ Std.LawfulEqCmp (compare : α → α → Ordering)

/-! ## Integers

Quint's `/` and `%` truncate toward zero, like JavaScript's `BigInt` and Rust's `/`: the remainder takes
the sign of the dividend. Lean's `Int./` rounds toward negative infinity instead. -/

namespace Int

def div (a b : _root_.Int) : _root_.Int := a.tdiv b

def mod (a b : _root_.Int) : _root_.Int := a.tmod b

/-- `i^j`. Quint fails at runtime for `j < 0` and for `0^0`; both are `1` here. -/
def pow (a b : _root_.Int) : _root_.Int := a ^ b.toNat

end Int

/-! ## Sets -/

namespace Set

variable {α β : Type} [Ord α] [Std.TransCmp (compare : α → α → Ordering)]
  [Ord β] [Std.TransCmp (compare : β → β → Ordering)]

def empty : Set α := ∅

def ofList (l : List α) : Set α := Std.ExtTreeSet.ofList l _

/-- The elements, in the order the comparison puts them. -/
def toList (s : Set α) : List α := Std.ExtTreeSet.toList s

def mem (x : α) (s : Set α) : Bool := Std.ExtTreeSet.contains s x

def insert (x : α) (s : Set α) : Set α := Std.ExtTreeSet.insert s x

def union (s t : Set α) : Set α := Std.ExtTreeSet.union s t

def intersect (s t : Set α) : Set α := Std.ExtTreeSet.filter (Std.ExtTreeSet.contains t ·) s

def exclude (s t : Set α) : Set α := Std.ExtTreeSet.filter (!Std.ExtTreeSet.contains t ·) s

def subseteq (s t : Set α) : Bool := (toList s).all (Std.ExtTreeSet.contains t ·)

def size (s : Set α) : _root_.Int := Std.ExtTreeSet.size s

def filter (s : Set α) (p : α → Bool) : Set α := Std.ExtTreeSet.filter p s

def map (s : Set α) (f : α → β) : Set β := ofList ((toList s).map f)

/-- `s.fold(init, f)`. Quint leaves the order open; this folds in the order the set stores. -/
def fold {γ : Type} (s : Set α) (init : γ) (f : γ → α → γ) : γ := (toList s).foldl f init

def «forall» (s : Set α) (p : α → Bool) : Bool := (toList s).all p

def «exists» (s : Set α) (p : α → Bool) : Bool := (toList s).any p

def flatten (ss : Set (Set α)) : Set α := (toList ss).foldl union empty

def powerset (s : Set α) : Set (Set α) :=
  ofList ((toList s).foldr (fun x acc => acc ++ acc.map (insert x)) [empty])

def isFinite (_ : Set α) : Bool := true

/-- `s.chooseSome()`: the first element in storage order. Quint promises only some element. -/
def chooseSome [Inhabited α] (s : Set α) : α := (toList s).headD default

/-- `s.getOnlyElement()`: the element of a set of one. Quint leaves any other size undefined; here it is
`default`, as for the other partial operators. -/
def getOnlyElement [Inhabited α] (s : Set α) : α :=
  match toList s with
  | [x] => x
  | _ => default

def tuples2 (s : Set α) (t : Set β) : Set (α × β) :=
  ofList ((toList s).flatMap fun a => (toList t).map fun b => (a, b))

/-- `a.to(b)`: the integers from `a` to `b`, inclusive. -/
def to (a b : _root_.Int) : Set _root_.Int :=
  ofList ((List.range (b - a + 1).toNat).map fun (i : Nat) => a + _root_.Int.ofNat i)

/-- Every list of length at most `n` over `s`. -/
def allListsUpTo (s : Set α) (n : _root_.Int) : Set (List α) :=
  let elems := toList s
  let rec go : Nat → List (List α)
    | 0 => [[]]
    | k + 1 =>
      let shorter := go k
      shorter ++ (shorter.filter (·.length == k)).flatMap fun l => elems.map (l ++ [·])
  ofList (go n.toNat)

end Set

/-! ## Maps -/

namespace Map

variable {κ ν : Type} [Ord κ] [Std.TransCmp (compare : κ → κ → Ordering)]
  [Ord ν] [Std.TransCmp (compare : ν → ν → Ordering)]

def empty : Map κ ν := ∅

/-- The pairs, in key order. -/
def entries (m : Map κ ν) : List (κ × ν) := Std.ExtTreeMap.toList m

def keys (m : Map κ ν) : Set κ := Set.ofList (Std.ExtTreeMap.keys m)

def hasKey (m : Map κ ν) (k : κ) : Bool := Std.ExtTreeMap.contains m k

/-- `m.get(k)`. Quint fails on a key the map does not have; here the value is `default`. -/
def get [Inhabited ν] (m : Map κ ν) (k : κ) : ν := Std.ExtTreeMap.getD m k default

/-- `m.put(k, v)` and `m.set(k, v)`. -/
def put (m : Map κ ν) (k : κ) (v : ν) : Map κ ν := Std.ExtTreeMap.insert m k v

def setBy [Inhabited ν] (m : Map κ ν) (k : κ) (f : ν → ν) : Map κ ν := put m k (f (get m k))

def mapBy (s : Set κ) (f : κ → ν) : Map κ ν :=
  (Set.toList s).foldl (fun m k => put m k (f k)) empty

/-- `Map(k1 -> v1, ...)`: a later pair with the same key overrides an earlier one. -/
def ofList (l : List (κ × ν)) : Map κ ν := l.foldl (fun m p => put m p.1 p.2) empty

/-- `s.setToMap()`. Which pair wins for a repeated key is unspecified in Quint; here, the last one in
key order. -/
def setToMap (s : Set (κ × ν)) : Map κ ν := ofList (Set.toList s)

/-- `dom.setOfMaps(cod)`: every map whose keys are `dom` and whose values are in `cod`. -/
def setOfMaps (dom : Set κ) (cod : Set ν) : Set (Map κ ν) :=
  Set.ofList <| (Set.toList dom).foldr
    (fun k acc => acc.flatMap fun m => (Set.toList cod).map fun v => put m k v) [empty]

end Map

/-! ## Lists -/

namespace List

variable {α : Type}

def length (l : _root_.List α) : _root_.Int := l.length

/-- `l[i]`. Quint fails out of bounds; here the value is `default`. -/
def nth [Inhabited α] (l : _root_.List α) (i : _root_.Int) : α :=
  if i < 0 then default else l.getD i.toNat default

def head [Inhabited α] (l : _root_.List α) : α := l.headD default

def tail (l : _root_.List α) : _root_.List α := l.tail

def indices (l : _root_.List α) : Set _root_.Int := Set.to 0 (l.length - 1)

def replaceAt (l : _root_.List α) (i : _root_.Int) (x : α) : _root_.List α := l.set i.toNat x

/-- `l.slice(i, j)`: the elements at indices `i` to `j - 1`. -/
def slice (l : _root_.List α) (i j : _root_.Int) : _root_.List α :=
  (l.drop i.toNat).take (j - i).toNat

/-- `range(i, j)`: the integers from `i` to `j - 1`, as a list. -/
def range (i j : _root_.Int) : _root_.List _root_.Int :=
  (_root_.List.range (j - i).toNat).map fun (k : Nat) => i + _root_.Int.ofNat k

def select (l : _root_.List α) (p : α → Bool) : _root_.List α := l.filter p

def foldl {β : Type} (l : _root_.List α) (init : β) (f : β → α → β) : β := l.foldl f init

def foldr {β : Type} (l : _root_.List α) (init : β) (f : α → β → β) : β := l.foldr f init

end List

/-! ## Reading an implication in a proof -/

/-- Quint's `a implies b`, which a spec's definitions return as `!a || b`, as Lean's implication. -/
theorem implies_eq_true (a b : Bool) : (!a || b) = true ↔ (a = true → b = true) := by
  cases a <;> simp

/-! ## Reading a set in a proof

Veil states invariants as propositions, so the embedding turns Quint's `forall`, `exists` and `in` over a
set into quantifiers, and a proof works with `x ∈ s` rather than with `contains`. -/

namespace Set

variable {α : Type} [Ord α] [Std.TransCmp (compare : α → α → Ordering)]
  [Std.LawfulEqCmp (compare : α → α → Ordering)]

omit [Std.LawfulEqCmp (compare : α → α → Ordering)] in
@[simp] theorem mem_eq_true (x : α) (s : Set α) : mem x s = true ↔ x ∈ s :=
  Std.ExtTreeSet.contains_iff_mem

omit [Std.LawfulEqCmp (compare : α → α → Ordering)] in
/-- `mem` where a spec does not compare it with `true`, as under the `!` of a guard. -/
@[simp, grind =] theorem mem_eq_decide (x : α) (s : Set α) : mem x s = decide (x ∈ s) := by
  rw [Bool.eq_iff_iff, mem_eq_true, decide_eq_true_iff]

@[simp, grind =] theorem mem_toList (x : α) (s : Set α) : x ∈ toList s ↔ x ∈ s :=
  Std.ExtTreeSet.mem_toList

/-- A spec picks from a set written out in the spec, so a proof about such a step reads the membership
back as a list membership. -/
@[simp, grind =] theorem mem_ofList (x : α) (l : List α) : x ∈ ofList l ↔ x ∈ l := by
  classical
  rw [ofList, Std.ExtTreeSet.mem_ofList, List.contains_iff_mem]

@[simp] theorem forall_eq_true (s : Set α) (p : α → Bool) :
    «forall» s p = true ↔ ∀ x ∈ s, p x = true := by
  simp [«forall», List.all_eq_true]

@[simp] theorem exists_eq_true (s : Set α) (p : α → Bool) :
    «exists» s p = true ↔ ∃ x ∈ s, p x = true := by
  simp [«exists», List.any_eq_true]

@[simp] theorem subseteq_eq_true (s t : Set α) : subseteq s t = true ↔ ∀ x ∈ s, x ∈ t := by
  simp [subseteq, List.all_eq_true]

/-- A property of every element of a set is decidable, which is what lets the model checker evaluate an
invariant that quantifies over a Quint set. -/
instance decidableBAll (s : Set α) (p : α → Prop) [DecidablePred p] : Decidable (∀ x ∈ s, p x) :=
  decidable_of_iff ((toList s).all fun x => decide (p x)) (by simp [List.all_eq_true])

instance decidableBEx (s : Set α) (p : α → Prop) [DecidablePred p] : Decidable (∃ x ∈ s, p x) :=
  decidable_of_iff ((toList s).any fun x => decide (p x)) (by simp [List.any_eq_true])

@[simp, grind =] theorem mem_filter (x : α) (s : Set α) (p : α → Bool) :
    x ∈ filter s p ↔ x ∈ s ∧ p x = true := by
  rw [filter, Std.ExtTreeSet.mem_filter]
  exact ⟨fun ⟨h, hp⟩ => ⟨h, by rwa [Std.ExtTreeSet.get_eq h] at hp⟩,
    fun ⟨h, hp⟩ => ⟨h, by rwa [Std.ExtTreeSet.get_eq h]⟩⟩

@[simp, grind =] theorem mem_intersect (x : α) (s t : Set α) : x ∈ intersect s t ↔ x ∈ s ∧ x ∈ t := by
  show x ∈ filter s (Std.ExtTreeSet.contains t ·) ↔ _
  simp

@[simp, grind =] theorem mem_exclude (x : α) (s t : Set α) : x ∈ exclude s t ↔ x ∈ s ∧ ¬ x ∈ t := by
  show x ∈ filter s (fun y => !Std.ExtTreeSet.contains t y) ↔ _
  rw [mem_filter]
  refine and_congr_right fun _ => ?_
  rw [Bool.not_eq_true', Bool.eq_false_iff, ne_eq, Std.ExtTreeSet.contains_iff_mem]

omit [Std.LawfulEqCmp (compare : α → α → Ordering)] in
@[simp, grind .] theorem mem_empty (x : α) : ¬ x ∈ (empty : Set α) := by simp [empty]

@[simp, grind =] theorem mem_insert (x y : α) (s : Set α) : x ∈ insert y s ↔ x = y ∨ x ∈ s := by
  rw [insert, Std.ExtTreeSet.mem_insert, Std.LawfulEqCmp.compare_eq_iff_eq]
  exact ⟨fun h => h.imp Eq.symm id, fun h => h.imp Eq.symm id⟩

omit [Std.LawfulEqCmp (compare : α → α → Ordering)] in
@[simp, grind =] theorem mem_union (x : α) (s t : Set α) : x ∈ union s t ↔ x ∈ s ∨ x ∈ t := by
  rw [union, Std.ExtTreeSet.union_eq, Std.ExtTreeSet.mem_union_iff]

/-- An element of `s.union(Set(y))` other than `y` is in `s`. -/
theorem mem_of_mem_union_ofList {s : Set α} {x y : α} (h : x ∈ union s (ofList [y])) (hne : x ≠ y) :
    x ∈ s := by
  rw [mem_union, mem_ofList, List.mem_singleton] at h
  exact h.resolve_right hne

@[simp, grind =] theorem mem_to (x a b : _root_.Int) : x ∈ to a b ↔ a ≤ x ∧ x ≤ b := by
  rw [to, mem_ofList, List.mem_map]
  constructor
  · rintro ⟨i, hi, rfl⟩
    rw [List.mem_range] at hi
    simp only [Int.ofNat_eq_natCast]
    omega
  · rintro ⟨h1, h2⟩
    exact ⟨(x - a).toNat, List.mem_range.mpr (by omega), by simp only [Int.ofNat_eq_natCast]; omega⟩

@[simp, grind =] theorem mem_flatten (x : α) (ss : Set (Set α)) : x ∈ flatten ss ↔ ∃ s ∈ ss, x ∈ s := by
  have key : ∀ (l : List (Set α)) (acc : Set α), x ∈ l.foldl union acc ↔ x ∈ acc ∨ ∃ s ∈ l, x ∈ s := by
    intro l
    induction l with
    | nil => simp
    | cons s l ih => intro acc; simp [ih, or_assoc]
  rw [flatten, key]
  simp

@[simp, grind =] theorem mem_powerset (t s : Set α) : t ∈ powerset s ↔ ∀ x ∈ t, x ∈ s := by
  have key : ∀ (l : List α) (t : Set α),
      t ∈ l.foldr (fun x acc => acc ++ acc.map (insert x)) [empty] ↔ ∀ y ∈ t, y ∈ l := by
    intro l
    induction l with
    | nil =>
      intro t
      simp only [List.foldr_nil, List.mem_singleton, List.not_mem_nil, imp_false]
      constructor
      · rintro rfl y; exact mem_empty y
      · intro h
        exact Std.ExtTreeSet.ext_mem fun y =>
          ⟨fun hy => absurd hy (h y), fun hy => absurd hy (mem_empty y)⟩
    | cons x l ih =>
      intro t
      simp only [List.foldr_cons, List.mem_append, List.mem_map, ih, List.mem_cons]
      constructor
      · rintro (h | ⟨u, hu, rfl⟩) y hy
        · exact Or.inr (h y hy)
        · rw [mem_insert] at hy
          exact hy.imp id (hu y)
      · intro h
        by_cases hl : ∀ y ∈ t, y ∈ l
        · exact Or.inl hl
        · -- `t` holds `x`, so it is `x` inserted into `t` without `x`, a subset of `l`.
          refine Or.inr ⟨Std.ExtTreeSet.erase t x, fun y hy => ?_, ?_⟩
          · rw [Std.ExtTreeSet.mem_erase, Ne, Std.LawfulEqCmp.compare_eq_iff_eq] at hy
            exact (h y hy.2).resolve_left (Ne.symm hy.1)
          · have hx : x ∈ t := by
              obtain ⟨y, hy, hyl⟩ : ∃ y ∈ t, y ∉ l := Classical.byContradiction fun hn =>
                hl fun y hy => Classical.byContradiction fun hyl => hn ⟨y, hy, hyl⟩
              exact (h y hy).resolve_right hyl ▸ hy
            refine Std.ExtTreeSet.ext_mem fun y => ?_
            rw [mem_insert, Std.ExtTreeSet.mem_erase, Ne, Std.LawfulEqCmp.compare_eq_iff_eq]
            by_cases hyx : y = x
            · subst hyx; simp [hx]
            · simp [hyx, Ne.symm hyx]
  rw [powerset, mem_ofList, key]
  simp only [mem_toList]

/-- A property that `init` has and that `f` keeps at every element of `s` holds of the fold, in whatever
order it visits them. -/
theorem fold_induction {γ : Type} {P : γ → Prop} {s : Set α} {init : γ} {f : γ → α → γ}
    (h0 : P init) (hf : ∀ acc, ∀ x ∈ s, P acc → P (f acc x)) : P (fold s init f) := by
  rw [fold]
  suffices ∀ (l : List α), (∀ x ∈ l, x ∈ s) → ∀ acc, P acc → P (l.foldl f acc) from
    this _ (fun x hx => (mem_toList x s).mp hx) init h0
  intro l
  induction l with
  | nil => intro _ acc h; exact h
  | cons x l ih =>
    intro hl acc h
    exact ih (fun y hy => hl y (List.mem_cons_of_mem x hy)) _ (hf acc x (hl x List.mem_cons_self) h)

section

variable {β : Type} [Ord β] [Std.TransCmp (compare : β → β → Ordering)]
  [Std.LawfulEqCmp (compare : β → β → Ordering)]

@[simp, grind =] theorem mem_map (y : β) (s : Set α) (f : α → β) : y ∈ map s f ↔ ∃ x ∈ s, f x = y := by
  simp only [map, mem_ofList, List.mem_map, mem_toList]

@[simp, grind =] theorem mem_tuples2 (p : α × β) (s : Set α) (t : Set β) :
    p ∈ tuples2 s t ↔ p.1 ∈ s ∧ p.2 ∈ t := by
  simp only [tuples2, mem_ofList, List.mem_flatMap, List.mem_map, mem_toList]
  constructor
  · rintro ⟨a, ha, b, hb, rfl⟩
    exact ⟨ha, hb⟩
  · rintro ⟨ha, hb⟩
    exact ⟨p.1, ha, p.2, hb, rfl⟩

omit [Std.LawfulEqCmp (compare : β → β → Ordering)] in
/-- Whether `y` is in what a fold builds from `init`, by a step `f` that adds `y` at exactly the elements
that `P` holds of. For `ms.fold(Set(), (acc, m) => match m { | V(r) => acc.union(Set(r)) | _ => acc })`,
`P` is `(V y = ·)`, and the step meets `hf` by `cases x <;> simp`. -/
theorem mem_fold {y : β} {s : Set α} {init : Set β} {f : Set β → α → Set β} {P : α → Prop}
    (hf : ∀ acc x, y ∈ f acc x ↔ y ∈ acc ∨ P x) : y ∈ fold s init f ↔ y ∈ init ∨ ∃ x ∈ s, P x := by
  have key : ∀ (l : List α) (acc : Set β), y ∈ l.foldl f acc ↔ y ∈ acc ∨ ∃ x ∈ l, P x := by
    intro l
    induction l with
    | nil => simp
    | cons x l ih => intro acc; simp [ih, hf, or_assoc]
  rw [fold, key]
  simp only [mem_toList]

omit [Std.LawfulEqCmp (compare : β → β → Ordering)] in
/-- A set that `s.fold(init, (acc, x) => acc.union(g(x)))` builds. -/
@[simp] theorem mem_fold_union (y : β) (s : Set α) (init : Set β) (g : α → Set β) :
    y ∈ fold s init (fun acc x => union acc (g x)) ↔ y ∈ init ∨ ∃ x ∈ s, y ∈ g x :=
  mem_fold fun acc x => mem_union y acc (g x)

end

end Set

/-! ## Counting a set

`size` is an `Int`, as in Quint, so a bound on it is linear arithmetic over `Int`, which `omega` and `grind`
decide. A majority of `S`, as a spec states one, is a subset `Q` with `2 * size Q > size S`. -/

namespace Set

variable {α : Type} [Ord α] [Std.TransCmp (compare : α → α → Ordering)]
  [Std.LawfulEqCmp (compare : α → α → Ordering)]

omit [Std.TransCmp (compare : α → α → Ordering)] [Std.LawfulEqCmp (compare : α → α → Ordering)] in
/-- `size` as the `Nat` that `Std.ExtTreeSet`'s lemmas count with. -/
theorem size_eq (s : Set α) : size s = (Std.ExtTreeSet.size s : _root_.Int) := rfl

omit [Std.TransCmp (compare : α → α → Ordering)] [Std.LawfulEqCmp (compare : α → α → Ordering)] in
theorem size_nonneg (s : Set α) : 0 ≤ size s := Int.natCast_nonneg _

grind_pattern size_nonneg => size s

theorem size_le_of_subseteq {s t : Set α} (h : ∀ x ∈ s, x ∈ t) : size s ≤ size t := by
  have hu : Std.ExtTreeSet.union s t = t := Std.ExtTreeSet.ext_mem fun k => by
    rw [Std.ExtTreeSet.union_eq, Std.ExtTreeSet.mem_union_iff]
    exact ⟨fun h' => h'.elim (h k) id, Or.inr⟩
  have := @Std.ExtTreeSet.size_left_le_size_union _ _ s t _
  rw [← Std.ExtTreeSet.union_eq, hu] at this
  simp only [size_eq]
  omega

theorem size_filter_le (s : Set α) (p : α → Bool) : size (filter s p) ≤ size s :=
  size_le_of_subseteq fun x hx => ((mem_filter x s p).mp hx).1

grind_pattern size_filter_le => size (filter s p)

@[simp] theorem size_ofList {l : List α} (h : l.Nodup) : size (ofList l) = l.length := by
  rw [size_eq, ofList, Std.ExtTreeSet.size_ofList]
  simp only [Std.LawfulEqCmp.compare_eq_iff_eq]
  exact h

/-- Two subsets of `S` whose sizes add up to more than the size of `S` share an element. -/
theorem exists_mem_of_size_add_gt {S A B : Set α} (hA : ∀ x ∈ A, x ∈ S) (hB : ∀ x ∈ B, x ∈ S)
    (h : size A + size B > size S) : ∃ x ∈ A, x ∈ B := by
  refine Classical.byContradiction fun hn => ?_
  have hd : ∀ x, x ∈ A → ¬ x ∈ B := fun x ha hb => hn ⟨x, ha, hb⟩
  have h1 := Std.ExtTreeSet.size_union_of_not_mem hd
  have h2 := size_le_of_subseteq (s := union A B) (t := S) fun x hx => by
    rcases (mem_union x A B).mp hx with h | h
    exacts [hA x h, hB x h]
  rw [union, Std.ExtTreeSet.union_eq] at h2
  simp only [size_eq, h1] at h h2
  omega

-- Not a `grind` lemma: its only patterns are three `size` terms, which grind instantiates at every triple
-- of sets, and it then fails among the cases.
/-- Quorum intersection: two majorities of `S` share an element. -/
theorem quorum_intersect {S A B : Set α} (hA : ∀ x ∈ A, x ∈ S) (hB : ∀ x ∈ B, x ∈ S)
    (qA : 2 * size A > size S) (qB : 2 * size B > size S) : ∃ x ∈ A, x ∈ B :=
  exists_mem_of_size_add_gt hA hB (by omega)

end Set

/-! ## Reading a map in a proof

A key of a map is read as `k ∈ m`, the membership of `Std.ExtTreeMap`. `get` of a key the map does not have
is `default` here, where Quint fails, which is why `get_mapBy` asks for the key to be in the set. -/

namespace Map

variable {κ ν : Type} [Ord κ] [Std.TransCmp (compare : κ → κ → Ordering)]
  [Std.LawfulEqCmp (compare : κ → κ → Ordering)]

@[simp, grind =] theorem mem_keys (k : κ) (m : Map κ ν) : k ∈ keys m ↔ k ∈ m := by
  rw [keys, Set.mem_ofList, Std.ExtTreeMap.mem_keys]

@[simp, grind =] theorem mem_put (j k : κ) (m : Map κ ν) (v : ν) : j ∈ put m k v ↔ j = k ∨ j ∈ m := by
  rw [put, Std.ExtTreeMap.mem_insert, Std.LawfulEqCmp.compare_eq_iff_eq, eq_comm]

@[simp, grind =] theorem mem_setBy [Inhabited ν] (j k : κ) (m : Map κ ν) (f : ν → ν) :
    j ∈ setBy m k f ↔ j = k ∨ j ∈ m :=
  mem_put j k m _

@[simp, grind =] theorem mem_mapBy (k : κ) (s : Set κ) (f : κ → ν) : k ∈ mapBy s f ↔ k ∈ s := by
  have key : ∀ (l : List κ) (m : Map κ ν),
      k ∈ l.foldl (fun m x => put m x (f x)) m ↔ k ∈ l ∨ k ∈ m := by
    intro l
    induction l with
    | nil => simp
    | cons x l ih =>
      intro m
      simp only [List.foldl_cons, ih, mem_put, List.mem_cons, or_assoc]
      exact or_left_comm
  rw [mapBy, key]
  simp [empty]

variable [Inhabited ν] [DecidableEq κ]

@[grind =] theorem get_put (m : Map κ ν) (k j : κ) (v : ν) :
    get (put m k v) j = if k = j then v else get m j := by
  rw [get, put, Std.ExtTreeMap.getD_insert]
  simp only [Std.LawfulEqCmp.compare_eq_iff_eq]
  rfl

@[simp] theorem get_put_self (m : Map κ ν) (k : κ) (v : ν) : get (put m k v) k = v := by
  simp [get_put]

@[simp] theorem get_put_of_ne {m : Map κ ν} {k j : κ} (v : ν) (h : k ≠ j) :
    get (put m k v) j = get m j := by
  simp [get_put, h]

@[grind =] theorem get_setBy (m : Map κ ν) (k j : κ) (f : ν → ν) :
    get (setBy m k f) j = if k = j then f (get m k) else get m j :=
  get_put m k j _

@[simp] theorem get_setBy_self (m : Map κ ν) (k : κ) (f : ν → ν) :
    get (setBy m k f) k = f (get m k) :=
  get_put_self m k _

@[simp] theorem get_setBy_of_ne {m : Map κ ν} {k j : κ} (f : ν → ν) (h : k ≠ j) :
    get (setBy m k f) j = get m j :=
  get_put_of_ne _ h

@[simp, grind =] theorem get_mapBy {s : Set κ} {k : κ} (f : κ → ν) (h : k ∈ s) :
    get (mapBy s f) k = f k := by
  have key : ∀ (l : List κ) (m : Map κ ν),
      get (l.foldl (fun m x => put m x (f x)) m) k = if k ∈ l then f k else get m k := by
    intro l
    induction l with
    | nil => simp
    | cons x l ih =>
      intro m
      rw [List.foldl_cons, ih, get_put]
      by_cases hk : x = k
      · subst hk; simp
      · simp [hk, Ne.symm hk]
  rw [mapBy, key]
  simp [h]

/-- A `put` that changes the value at `k` changes the map, which a step of `⟨A⟩_v` needs to be enabled. -/
theorem put_ne_of_get_ne {m : Map κ ν} {k : κ} {v : ν} (h : get m k ≠ v) : put m k v ≠ m := by
  intro he
  apply h
  have := get_put_self m k v
  rwa [he] at this

/-- A map of `dom.setOfMaps(cod)` maps each key of `dom` to a value of `cod`. -/
theorem get_mem_of_mem_setOfMaps [Ord ν] [Std.TransCmp (compare : ν → ν → Ordering)]
    [Std.LawfulEqCmp (compare : ν → ν → Ordering)] [Std.LawfulEqCmp (compare : Map κ ν → Map κ ν → Ordering)]
    {m : Map κ ν} {dom : Set κ} {cod : Set ν} {k : κ} (hm : m ∈ setOfMaps dom cod) (hk : k ∈ dom) :
    get m k ∈ cod := by
  suffices h : ∀ (l : List κ) (m : Map κ ν),
      m ∈ l.foldr (fun k acc => acc.flatMap fun m => (Set.toList cod).map fun v => put m k v) [empty] →
      ∀ k ∈ l, get m k ∈ cod from
    h (Set.toList dom) m (by rw [setOfMaps, Set.mem_ofList] at hm; exact hm) k ((Set.mem_toList k dom).mpr hk)
  intro l
  induction l with
  | nil => simp
  | cons k0 l ih =>
    intro m hm k hk
    simp only [_root_.List.foldr_cons, _root_.List.mem_flatMap, _root_.List.mem_map] at hm
    obtain ⟨m', hm', v, hv, rfl⟩ := hm
    rw [get_put]
    split
    · exact (Set.mem_toList v cod).mp hv
    · exact ih m' hm' k (by simp at hk; grind)

end Map

/-! ## Reading a list in a proof

Quint's `append` and `concat` are Lean's `++`, and a list literal is a Lean list, so the lemmas below read
`length`, `nth` and the folds through `++` and `::`. Indices and lengths are `Int`, as in Quint, and `nth` of an index out of bounds is `default`. Inside
`namespace Quint`, `List.length_cons` and the like name the lemmas below; Lean's are `_root_.List`'s. -/

namespace List

variable {α : Type}

/-- `length` as the `Nat` that Lean's list lemmas count with. -/
theorem length_eq (l : _root_.List α) : length l = (l.length : _root_.Int) := rfl

@[simp, grind =] theorem length_nil : length ([] : _root_.List α) = 0 := rfl

@[simp, grind =] theorem length_cons (x : α) (l : _root_.List α) : length (x :: l) = length l + 1 := by
  simp [length]

@[simp, grind =] theorem length_append (a b : _root_.List α) :
    length (a ++ b) = length a + length b := by
  simp [length]

theorem length_nonneg (l : _root_.List α) : 0 ≤ length l := Int.natCast_nonneg _

grind_pattern length_nonneg => length l

@[simp, grind =] theorem length_replaceAt (l : _root_.List α) (i : _root_.Int) (x : α) :
    length (replaceAt l i x) = length l := by
  simp [length, replaceAt]

@[simp, grind =] theorem length_range (i j : _root_.Int) : length (range i j) = max (j - i) 0 := by
  simp only [length, range, _root_.List.length_map, _root_.List.length_range]
  omega

@[simp, grind =] theorem length_slice {l : _root_.List α} {i j : _root_.Int} (h0 : 0 ≤ i) (hij : i ≤ j)
    (hj : j ≤ length l) : length (slice l i j) = j - i := by
  simp only [length, slice, _root_.List.length_take, _root_.List.length_drop] at *
  omega

/-- `l.slice(0, n)` is the first `n` elements of `l`. -/
theorem slice_zero (l : _root_.List α) (n : _root_.Int) : slice l 0 n = l.take n.toNat := by
  simp [slice]

/-- The first `n` elements of `a` are a prefix of `l` exactly when `l` starts with them. -/
theorem take_prefix_iff {a l : _root_.List α} {n : Nat} (hn : n ≤ a.length) :
    a.take n <+: l ↔ n ≤ l.length ∧ a.take n = l.take n := by
  grind [_root_.List.IsPrefix.length_le, _root_.List.length_take, _root_.List.prefix_iff_eq_take,
    _root_.List.take_prefix]

/-- A slice of `l` that has all the `j - i` elements it asks for is the same slice of any extension of
`l`. -/
theorem slice_append {l : _root_.List α} (es : _root_.List α) {i j : _root_.Int}
    (h : length (slice l i j) = j - i) : slice (l ++ es) i j = slice l i j := by
  unfold slice at h ⊢
  simp only [length, _root_.List.length_take] at h
  rw [_root_.List.drop_append, _root_.List.take_append,
    show (j - i).toNat - (_root_.List.drop i.toNat l).length = 0 by omega, _root_.List.take_zero,
    _root_.List.append_nil]

@[simp, grind =] theorem mem_range (x i j : _root_.Int) : x ∈ range i j ↔ i ≤ x ∧ x < j := by
  simp only [range, _root_.List.mem_map, _root_.List.mem_range]
  constructor
  · rintro ⟨k, hk, rfl⟩
    simp only [Int.ofNat_eq_natCast]
    omega
  · rintro ⟨h1, h2⟩
    exact ⟨(x - i).toNat, by omega, by simp only [Int.ofNat_eq_natCast]; omega⟩

@[simp, grind =] theorem mem_indices (i : _root_.Int) (l : _root_.List α) :
    i ∈ indices l ↔ 0 ≤ i ∧ i < length l := by
  simp only [indices, Set.mem_to, length]
  omega

@[simp, grind =] theorem mem_select (x : α) (l : _root_.List α) (p : α → Bool) :
    x ∈ select l p ↔ x ∈ l ∧ p x = true :=
  _root_.List.mem_filter

section Fold

variable {β : Type} (init : β)

@[simp, grind =] theorem foldl_nil (f : β → α → β) : foldl [] init f = init := rfl

@[simp, grind =] theorem foldl_cons (x : α) (l : _root_.List α) (f : β → α → β) :
    foldl (x :: l) init f = foldl l (f init x) f := rfl

@[simp, grind =] theorem foldl_append (a b : _root_.List α) (f : β → α → β) :
    foldl (a ++ b) init f = foldl b (foldl a init f) f :=
  _root_.List.foldl_append

@[simp, grind =] theorem foldr_nil (f : α → β → β) : foldr [] init f = init := rfl

@[simp, grind =] theorem foldr_cons (x : α) (l : _root_.List α) (f : α → β → β) :
    foldr (x :: l) init f = f x (foldr l init f) := rfl

@[simp, grind =] theorem foldr_append (a b : _root_.List α) (f : α → β → β) :
    foldr (a ++ b) init f = foldr a (foldr b init f) f :=
  _root_.List.foldr_append

end Fold

variable [Inhabited α]

@[simp, grind =] theorem head_cons (x : α) (l : _root_.List α) : head (x :: l) = x := rfl

omit [Inhabited α] in
@[simp, grind =] theorem tail_cons (x : α) (l : _root_.List α) : tail (x :: l) = l := rfl

/-- `nth` as Lean's `getElem?`, which Lean's list lemmas read. -/
theorem nth_eq (l : _root_.List α) (i : _root_.Int) :
    nth l i = if i < 0 then default else (l[i.toNat]?).getD default := by
  simp [nth, _root_.List.getD_eq_getElem?_getD]

@[grind =] theorem nth_append (a b : _root_.List α) (i : _root_.Int) :
    nth (a ++ b) i = if i < length a then nth a i else nth b (i - length a) := by
  simp only [nth_eq, length, _root_.List.getElem?_append]
  by_cases h0 : i < 0
  · have : i < (a.length : _root_.Int) := by omega
    simp [h0, this]
  · by_cases h1 : i < (a.length : _root_.Int)
    · simp [h0, h1, show i.toNat < a.length by omega]
    · rw [show i.toNat - a.length = (i - a.length).toNat by omega]
      simp [h0, h1, show ¬ i.toNat < a.length by omega, show ¬ i - a.length < 0 by omega]

@[simp] theorem nth_append_left {a : _root_.List α} (b : _root_.List α) {i : _root_.Int}
    (h : i < length a) : nth (a ++ b) i = nth a i := by
  simp [nth_append, h]

@[simp] theorem nth_append_right {a : _root_.List α} (b : _root_.List α) {i : _root_.Int}
    (h : length a ≤ i) : nth (a ++ b) i = nth b (i - length a) := by
  simp [nth_append, show ¬ i < length a by omega]

/-- A list reads as each of its prefixes at the indices that the prefix has. -/
theorem nth_of_prefix {a l : _root_.List α} (h : a <+: l) {i : _root_.Int} (hi : i < length a) :
    nth l i = nth a i := by
  obtain ⟨t, rfl⟩ := h
  exact nth_append_left t hi

@[grind =] theorem nth_cons (x : α) (l : _root_.List α) (i : _root_.Int) :
    nth (x :: l) i = if i = 0 then x else nth l (i - 1) := by
  simp only [nth_eq]
  by_cases h0 : i < 0
  · simp [h0, show i ≠ 0 by omega, show i - 1 < 0 by omega]
  · by_cases h1 : i = 0
    · simp [h1]
    · rw [show i.toNat = (i - 1).toNat + 1 by omega]
      simp [h0, h1, show ¬ i - 1 < 0 by omega]

@[simp] theorem nth_cons_zero (x : α) (l : _root_.List α) : nth (x :: l) 0 = x := rfl

theorem nth_mem {l : _root_.List α} {i : _root_.Int} (h0 : 0 ≤ i) (h : i < length l) :
    nth l i ∈ l := by
  simp only [nth_eq, show ¬ i < 0 by omega, ite_false]
  have : i.toNat < l.length := by simp only [length] at h; omega
  simp [_root_.List.getElem?_eq_getElem this, _root_.List.getElem_mem]

/-- `replaceAt` of a negative index replaces the first element, hence `0 ≤ i`. -/
@[grind =] theorem nth_replaceAt (l : _root_.List α) {i : _root_.Int} (x : α) (j : _root_.Int)
    (hi : 0 ≤ i) : nth (replaceAt l i x) j = if i = j ∧ i < length l then x else nth l j := by
  simp only [nth_eq, replaceAt, length, _root_.List.getElem?_set]
  by_cases hj : j < 0
  · simp [hj, show i ≠ j by omega]
  · by_cases hij : i = j
    · subst hij
      by_cases hl : i < (l.length : _root_.Int)
      · simp [hj, hl, show i.toNat < l.length by omega]
      · simp [hj, hl, show ¬ i.toNat < l.length by omega]
    · simp [hj, hij, show i.toNat ≠ j.toNat by omega]

@[simp] theorem nth_replaceAt_self (l : _root_.List α) {i : _root_.Int} (x : α) (h0 : 0 ≤ i)
    (h : i < length l) : nth (replaceAt l i x) i = x := by
  simp [nth_replaceAt l x i h0, h]

@[simp] theorem nth_replaceAt_of_ne (l : _root_.List α) {i j : _root_.Int} (x : α) (h0 : 0 ≤ i)
    (h : i ≠ j) : nth (replaceAt l i x) j = nth l j := by
  simp [nth_replaceAt l x j h0, h]

@[simp, grind =] theorem nth_range {i j k : _root_.Int} (h0 : 0 ≤ k) (h : k < j - i) :
    nth (range i j) k = i + k := by
  simp only [nth_eq, range, show ¬ k < 0 by omega, ite_false, _root_.List.getElem?_map,
    _root_.List.getElem?_range (show k.toNat < (j - i).toNat by omega)]
  simp only [Option.map_some, Option.getD_some, Int.ofNat_eq_natCast]
  omega

/-- `slice` of a negative start reads from the first element, hence `0 ≤ i`. -/
@[simp, grind =] theorem nth_slice {l : _root_.List α} {i j k : _root_.Int} (h0 : 0 ≤ i) (hk0 : 0 ≤ k)
    (hk : k < j - i) : nth (slice l i j) k = nth l (i + k) := by
  simp only [nth_eq, slice, show ¬ k < 0 by omega, show ¬ i + k < 0 by omega, ite_false,
    _root_.List.getElem?_take, _root_.List.getElem?_drop]
  simp [show k.toNat < (j - i).toNat by omega, show i.toNat + k.toNat = (i + k).toNat by omega]

end List

/-! ## Traces

A model checker's trace shows each value through Veil's `Display`. A pair has no structured instance
of its own, so without this one it shows its `Repr`, `(1, "a")`, as a string; this one shows it as a
constructor with its components, which a reader of the JSON takes apart without parsing Lean. -/

instance [Veil.Display α] [Veil.Display β] : Veil.Display (α × β) where
  display p := Veil.ValueDisplay.ctorJson "Prod" "mk" [(none, Veil.Display.display p.1),
    (none, Veil.Display.display p.2)]

/-- `Option` is Quint's `Some(v) | None`, and shows as that variant. -/
instance [Veil.Display α] : Veil.Display (Option α) where
  display
    | some v => Veil.ValueDisplay.ctorJson "Option" "Some" [(some "v", Veil.Display.display v)]
    | none => Veil.ValueDisplay.ctorJson "Option" "None" []

/-- Veil writes a lasso's states by `ToJson`, and Lean's own instance writes both `none` and `some none` as
`null`. -/
instance (priority := high) [Lean.ToJson α] : Lean.ToJson (Option α) where
  toJson
    | some v => Veil.ValueDisplay.ctorJson "Option" "Some" [(some "v", Lean.toJson v)]
    | none => Veil.ValueDisplay.ctorJson "Option" "None" []

end Quint
