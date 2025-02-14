import Resource from "@/app/ui/resource";

import lifeline988Image from "@/public/resources/988lifeline.png";
import dbsaImage from "@/public/resources/dbsa.png";
import trevorImage from "@/public/resources/trevor.png";
import ommImage from "@/public/resources/omm.png";
import namiImage from "@/public/resources/nami.jpg";
import hotlineImage from "@/public/resources/hotline.png";
import safeImage from "@/public/resources/safe.png";
import lhicImage from "@/public/resources/HCLHIC.png";
import { rethinkSans } from "../ui/fonts";

const resources = [
  {
    title: "988 Suicide & Crisis Lifeline",
    description: "The 988 Lifeline is a nationwide network of local crisis centers offering free and confidential emotional support to individuals experiencing suicidal crises or emotional distress, available 24/7 across the U.S.",
    image: lifeline988Image,
    link: "https://988lifeline.org"
  },
  {
    title: "Depression and Bipolar Support Alliance (DBSA)",
    description: "DBSA offers support, education, and advocacy for individuals with mood disorders. They aim to create inclusive spaces and equitable access to mental health resources for everyone.",
    image: dbsaImage,
    link: "https://www.dbsalliance.org"
  },
  {
    title: "The Trevor Project (1-866-488-7386)",
    description: "The Trevor Project is a nonprofit focused on preventing suicide among LGBTQ+ youth and providing education and research on LGBTQ studies. Calling their number will connect with a counselor!",
    image: trevorImage,
    link: "https://www.thetrevorproject.org"
  },
  {
    title: "Our Minds Matter",
    description: "Our Minds Matter aims to prevent teen suicide by providing mental health education, resources, and support. They are dedicated to empowering teens to take charge of their mental well-being and creating a supportive community.",
    image: ommImage,
    link: "https://ourmindsmatter.org"
  },
  {
    title: "National Alliance on Mental Illness, NAMI Maryland (800-950-6264)",
    description: "NAMI is the largest grassroots mental health organization in the United States. It offers education, support and advocacy for individuals and families affected by mental illness.",
    image: namiImage,
    link: "https://www.nami.org"
  },
  {
    title: "National Human Trafficking Hotline (1-888-373-7888)",
    description: "The National Human Trafficking Hotline is a confidential, 24/7 service that provides critical support to victims and survivors of human trafficking. It can also be used to report trafficking situations.",
    image: hotlineImage,
    link: "https://humantraffickinghotline.org"
  },
  {
    title: "SAFE Center for Human Trafficking Survivors",
    description: "University of Maryland SAFE Center provides trauma-informed services to empower survivors of human trafficking, while also conducting research and advocating for policy changes.",
    image: safeImage,
    link: "https://umdsafecenter.org"
  },
  {
    title: "Howard County LHIC",
    description: "The Local Health Improvement Coalition (LHIC) works to achieve health equity in Howard County. Participation is sought from individuals and organizations working to achieve optimal health and wellness for all Howard County residents.",
    image: lhicImage,
    link: "https://www.hclhic.org/healthy/mental-health"
  }
];

export default function Page() {
  return (
    <div className="relative flex flex-col justify-center gap-8 w-3/5 h-[75vh]">
      <h1 className={`text-orange-600 font-extrabold text-[46px] leading-[1] ${rethinkSans.className}`}>
        Mental health resources,<br/>curated for you.
      </h1>
      <div className="h-[63vh] overflow-scroll space-y-4">
        {
          resources.map((resource, index) => 
            <Resource title={resource.title} description={resource.description} pathToImage={resource.image} link={resource.link} key={index} />
          )
        }
      </div>
    </div>
  )
}