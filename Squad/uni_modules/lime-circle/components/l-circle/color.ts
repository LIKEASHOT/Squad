// @ts-nocheck
// convert #hex notation to rgb array
const parseColor = function (hexStr: string): number[] | null {
  if (!/^#.{3,6}$/.test(hexStr)) {
    console.error('lime-circle: 渐变仅支持hex值');
    return [0, 0, 0] as number[];
  }
  return hexStr.length == 4
    ? hexStr.substring(1).split('').map((s: string): number => {
        return 0x11 * parseInt(s, 16);
      })
    : [
        hexStr.substring(1, 3),
        hexStr.substring(3, 5),
        hexStr.substring(5, 7),
      ].map((s:string):number=> {
        return parseInt(s, 16);
      });
};


// zero-pad 1 digit to 2
const pad = function (s: string):string {
  return s.padStart(2, '0')
};

export const gradientColors = function (start: string, end: string, steps: number, gamma: number):string[] {
  let i:number, j:number, ms:number, me:number, output:string[] = [], so = ['', '','']
	const normalize = (channel: number):number=>{
	   return Math.pow(channel / 255, gamma);
  }
  const startColor = parseColor(start)!.map(normalize);
  const endColor = parseColor(end)!.map(normalize);
	if(startColor.length == 0 && endColor.length == 0) return []
	for (i = 0; i < steps; i++) {
		ms = i / (steps - 1);
    me = 1 - ms;
    for (j = 0; j < 3; j++) {
			// #ifdef APP-ANDROID
			so[j] = pad(Math.round(Math.pow(startColor[j] * me + endColor[j] * ms, 1 / gamma) * 255).toInt().toString(16));
			// #endif
			// #ifndef APP-ANDROID
			so[j] = pad(Math.round(Math.pow(startColor[j] * me + endColor[j] * ms, 1 / gamma) * 255).toString(16));
			// #endif
    }
    output.push('#' + so.join(''));
  }
  return output;
};
