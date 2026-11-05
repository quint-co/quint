module minimal {
  type Option[a] = Some(a) | None
  type Prod = { m: int }
  type Req = { c: int }
  // Parameter annotated `Option` (bare) instead of `Option[a]`.
  pure def is_some(o: Option): bool = match o { | Some(_) => true | None => false }
  pure def use(prod: Option[Prod], req: Option[Req]): bool =
    is_some(prod) and is_some(req)
}
