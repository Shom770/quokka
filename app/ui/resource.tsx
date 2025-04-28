import Image, { StaticImageData } from 'next/image';
import { inter } from './fonts'

interface ResourceProps {
  title: string;
  description: string;
  pathToImage: StaticImageData;
  link: string;
}

export default function Resource({ title, description, pathToImage, link }: ResourceProps) {
  return (
    <div className="bg-orange-600/5 border-2 border-orange-600/75 flex flex-row items-center justify-center gap-8 w-full h-36 rounded-lg">
      <Image 
        src={pathToImage}
        alt={`Logo of ${title}`}
        className="rounded-lg"
        width={100}
        height={100}
        placeholder="blur"
      />
      <div className="flex flex-col justify-center h-24 w-5/6">
        <a href={link} className="text-xl font-extrabold text-black hover:text-blue-500 transition-all duration-200">{title}</a>
        <p className={`${inter.className} antialiased text-black`}>{description}</p>
      </div>
    </div>
  );
}