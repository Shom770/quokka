export default function FocusPill({
   emoji,
   name,
   isSelected,
   onToggle
}: {
   emoji: string,
   name: string,
   isSelected: boolean,
   onToggle: (isSelected: boolean) => void
}) {
   return (
       <button
           className={`duration-200 flex flex-row items-center justify-center gap-2 basis-1/4 h-16 rounded-xl font-extrabold px-4 py-2 ${!isSelected ? 'bg-orange-600/10 border border-orange-600 text-orange-600' : 'bg-orange-600 text-white'}`}
           onClick={() => onToggle(!isSelected)}>
           <h1 className="text-2xl">{emoji}</h1>
           <p>{name}</p>
       </button>
   )
}
