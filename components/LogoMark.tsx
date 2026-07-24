/**

 * Dakshin Vihar — Brand mark

 *

 * A stylised South-Indian lotus / kolam motif.

 * Used in the Navbar and Footer alongside the wordmark text.

 *

 * To replace with a real image later:

 *   1. Drop logo.png / logo.svg into /public

 *   2. Replace this component with:

 *        <Image src="/logo.png" alt="Dakshin Vihar" width={...} height={...} />

 */


 

interface Props {

  size?:  number;

  /** Tailwind / CSS colour for the petals — defaults to the brand gold */

  color?: string;

}


 

export default function LogoMark({ size = 36, color = '#D8B15A' }: Props) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 36 36"

      fill="none"

      aria-hidden="true"

    >

      {/* Outer ring */}

      <circle cx="18" cy="18" r="16.5" stroke={color} strokeWidth="1.2" opacity="0.5" />


 

      {/* Cardinal petals */}

      <path d="M18 5 C20.5 10.5 20.5 14.5 18 18 C15.5 14.5 15.5 10.5 18 5Z"         fill={color} />

      <path d="M31 18 C25.5 20.5 21.5 20.5 18 18 C21.5 15.5 25.5 15.5 31 18Z"         fill={color} />

      <path d="M18 31 C15.5 25.5 15.5 21.5 18 18 C20.5 21.5 20.5 25.5 18 31Z"         fill={color} />

      <path d="M5 18 C10.5 15.5 14.5 15.5 18 18 C14.5 20.5 10.5 20.5 5 18Z"          fill={color} />


 

      {/* Diagonal petals (slightly transparent) */}

      <path d="M9.5 9.5 C12.5 13 14.5 15.5 18 18 C14.5 14.5 13 12.5 9.5 9.5Z"       fill={color} opacity="0.55" />

      <path d="M26.5 9.5 C23.5 13 21.5 15.5 18 18 C21.5 14.5 23 12.5 26.5 9.5Z"     fill={color} opacity="0.55" />

      <path d="M26.5 26.5 C23.5 23 21.5 20.5 18 18 C21.5 21.5 23 23.5 26.5 26.5Z"   fill={color} opacity="0.55" />

      <path d="M9.5 26.5 C12.5 23 14.5 20.5 18 18 C14.5 21.5 13 23.5 9.5 26.5Z"     fill={color} opacity="0.55" />


 

      {/* Centre seed */}

      <circle cx="18" cy="18" r="3" fill={color} />

    </svg>

  );

}