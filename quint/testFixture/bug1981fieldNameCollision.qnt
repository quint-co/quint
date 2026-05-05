module bug1981fieldNameCollision {
  type Inner = { authority: int, round: int }

  var data: { reference: Inner, trace: List[Inner] }

  action init = {
    data' = { reference: { authority: 0, round: 0 }, trace: [] }
  }

  action step = {
    data' = {
      reference: { authority: 1, round: data.reference.round + 1 },
      trace: data.trace.append(data.reference),
    }
  }
}
