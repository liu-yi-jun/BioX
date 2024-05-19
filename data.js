a = [
  [{ value: [250, 1] }, { value: [250, 1] }],
  [
    { value: [250, [0, 1, 2, 3]] },
    { value: [250, [0, 1, 2, 3]] },
    { value: [250, [0, 1, 2, 3]] },
  ],
];

b = [
  {
    name: [
      [0, 1, 2, 3],
      [0, 1, 2, 3],
    ],
  },
  {
    name: [
      [0, 1, 2, 3],
      [0, 1, 2, 3],
    ],
  },
];

c = [
  [
    [0, 1, 2, 3],
    [1, 1, 2, 3],
  ],
  [
    [2, 1, 2, 3],
    [3, 1, 2, 3],
  ],
];

d = [
  [
    [0, 1, 2, 3,4],
    [2, 1, 2, 3,4],
  ],
  [],
];

outDataList= []
for (let i = 0; i < channel; i++) {
  outDataList.push([]);
}

c.forEach((item,index)=> {
  for (let i = 0; i < channel; i++) {
    outDataList[i].push(item[i]);
  }
})


c=[[x,y,value]] = [mapIndex,item[channelIndex],item[channelIndex][valueIndex]]



let reslut = []
for (let x = 0; x < d.length; x++) {
  psdItems = d[x][channelIndex]
  psdItems.forEach((value,y) => {
    reslut.push([x,y,value])
  });
}