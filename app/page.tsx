import Image from "next/image";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { TbCup, TbHeart, TbMilk, TbSnowflake, TbBolt, TbSparkles, TbFlame, TbLeaf } from "react-icons/tb";
import { GiStrawberry } from "react-icons/gi";

const categories = [
  { name: "All Drinks", icon: TbCup, link:"" },
  { name: "Signatures", icon: TbHeart, link:"https://chatime.com.au/drinks/categories/signatures" },
  { name: "Fruity", icon: GiStrawberry, link:"https://chatime.com.au/drinks/categories/fruity" },
  { name: "Milky", icon: TbMilk, link:"https://chatime.com.au/drinks/categories/milky" },
  { name: "Frozen", icon: TbSnowflake, link:"https://chatime.com.au/drinks/categories/frozen" },
  { name: "Cha-rge Energy", icon: TbBolt, link:"https://chatime.com.au/drinks/categories/cha-rge-energy" },
  { name: "Sparkling", icon: TbSparkles, link:"https://chatime.com.au/drinks/categories/sparkling" },
  { name: "Hot", icon: TbFlame, link:"https://chatime.com.au/drinks/categories/hot" },
  { name: "Classic", icon: TbLeaf, link:"https://chatime.com.au/drinks/categories/classic-tea" },
];

const DRINK_SIZE = 330;
const drinks = [
  {name: "Premium Pearl Milk Tea", picture: "/Premium-Pearl.webp", rotationClass: "-rotate-[5deg]"},
  {name: "Brown Sugar", picture: "/Brown-Sugar.webp", rotationClass: "-rotate-[6deg]"},
  {name: "Pop it Like It's Peach", picture: "/Pop-it-like-it_s-peach.webp", rotationClass: "rotate-[5deg]"},
  {name: "Cookies and Cream", picture: "/Cookies-Cream.webp", rotationClass: "-rotate-[2deg]"},
  {name: "Strawberry Matcha Latte", picture: "/Matcha_Strawberry_Milky-Ecomm_1080x1080px.webp", rotationClass: "-rotate-[0deg]"},
  {name: "Grape Vibes", picture: "/Grape-Vibes-with-Grape-Jelly_Ecomm-1080x1080px.png", rotationClass: "rotate-[3deg]"}
]

export default function Home() {

  return (
    <div>
      {/* Header */}
      <div className="w-full min-h-[11rem] bg-[rgb(80,7,120)] flex flex-col lg:flex-row justify-between items-center px-6 lg:px-24 py-6 border-b-2 border-[#8552A1] gap-6">
        <Image
          src="chatime-stacked-white-YLD3ICQX.svg"
          width={96}
          height={96}
          alt="Picture of the author"
        />

        <div className="text-white font-bold flex items-center justify-center flex-wrap gap-4 lg:gap-9 text-sm lg:text-xl">
          <a href="https://portal.chatime.com.au/drinks/" className="hover:underline">Drinks</a>
          <a href="https://portal.chatime.com.au/loyal-tea-club/" className="hover:underline">Loyal-Tea</a>
          <a href="https://shop.chatime.com.au/" className="hover:underline">Shop</a>
          <a href="https://portal.chatime.com.au/stores/" className="hover:underline">Our Stores</a>
          <a href="https://portal.chatime.com.au/about-us/" className="hover:underline">About Us</a>
          <a href="https://chatimefranchise.com.au/" className="hover:underline">Franchise</a>
        </div>

        <div className="xl:flex items-center flex-row hidden gap-6 lg:gap-9">
          <a href="https://www.instagram.com/chatimeaustralia/"><FaInstagram color="white" size="2em"/></a>
          <a href="https://www.tiktok.com/@chatimeau"><FaTiktok color="white" size="2em"/></a>
          <a href="https://www.facebook.com/CHATIMEAustralia"><FaLinkedin color="white" size="2em"/></a>
          <a href="https://www.linkedin.com/company/chatimegroup/"><FaFacebook color="white" size="2em"/></a>
        </div>
      </div>

      {/* Contents */}
      <div className="bg-[#500778] w-full p-6 flex flex-col justify-center items-center gap-x-5">

        {/* Pick Drink something */}
        <div className="pt-6 justify-center flex flex-col w-full">
          <h2 className="text-white text-center font-black text-4xl lg:text-6xl mb-12 tracking-wide uppercase">
            Explore More
          </h2>

          <div className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide w-max max-w-full mx-auto">
            {categories.map((cat, index) => {
              const Icon = cat.icon;

              return (
                <a key={cat.name} href={cat.link}>
                  <button
                    className={`
                      flex flex-col items-center justify-center flex-shrink-0 
                      w-[104px] h-[104px] rounded-2xl gap-2 transition-all duration-200
                      ${index == 0 
                        ? "bg-[#F58220] shadow-lg"
                        : "bg-white/10 hover:bg-[#F58220]"
                      } 
                    `}
                  >
                    <Icon 
                      className="text-white text-4xl stroke-[1.5]" 
                    />
                    <span className="text-white text-xs font-bold text-center leading-tight px-1">
                      {cat.name}
                    </span>
                  </button>
                </a>
              );
            })}
          </div>
        </div>

        {/* Spacing */}
        <div className="py-8"/>

        {/* Drink Selection */}
        <div className="flex flex-row overflow-x-auto w-max max-w-full lg:justify-center lg:w-full mx-auto pb-8 snap-x scrollbar-hide">
          {drinks.map((drink, index) => (
            <div key={index} className="text-white font-bold flex flex-col items-center text-center relative p-0 min-w-[260px] md:min-w-0 -mx-4 md:-mx-14 snap-center">
              <span className="px-4">{drink.name}</span>
              <div className="relative">
                <Image
                  src={drink.picture}
                  width={DRINK_SIZE}
                  height={DRINK_SIZE}
                  alt={drink.name}
                  className={`relative max-w-full h-auto ${drink.rotationClass}`}
                />
                <div className="absolute top-[20%] left-1/4 border-2 rounded-full bg-[#19BECF] border-[#19BECF] w-9 h-9 flex justify-center items-center text-2xl z-20">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cups of Joy */}
      <div className="w-full bg-[#F4F0F5]">
        <WaveDivider fill="#500778"/>
        
        <div className="w-full flex flex-col md:flex-row justify-center items-center py-20 gap-16 md:gap-32 px-10">
          <div className="flex flex-col items-center md:items-start text-[#500778]">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-wide">Cups of Joy</h2>
            <a href="https://chatime.com.au/drinks/">
              <button className="bg-[#00A862] hover:bg-[#812990] hover:text-white hover:scale-110 hover:duration-150 transition-colors text-white px-8 py-3 rounded-full w-fit font-black text-sm tracking-wide">
                Get Sipping!
              </button>
            </a>
          </div>
          <div className="relative">
            <Image 
              src="/Round_bubbletea.webp" 
              width={450} 
              height={450} 
              alt="Cups of Joy" 
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Jasmine Tea */}
      <div className="w-full bg-[#812990]">
        <WaveDivider fill="#F4F0F5"/>
        
        <div className="w-full flex flex-col md:flex-row justify-center items-center pt-24 pb-16 gap-16 md:gap-32 px-10">
          <div className="relative">
            <Image 
              src="/fdb15aea-7cb9-44c8-a962-c7726813cb83.webp" 
              width={450} 
              height={450} 
              alt="New Jasmine Green Tea" 
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-start text-white max-w-lg">
            <p className="font-bold tracking-widest uppercase mb-2 text-sm">
              New
            </p>
            <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-wide leading-tight">
              Jasmine Green<br/>Tea
            </h2>
            <p className="text-base md:text-lg mb-8 font-medium leading-relaxed">
              Introducing our new and improved Jasmine Green Tea. A bolder flavour with a refined floral aroma, the perfect pairing to your cup of Chatime.
            </p>
            <a href="https://portal.chatime.com.au/jasmine-green-tea/">
              <button className="bg-[#00A862] hover:bg-white hover:text-[#00A862] hover:scale-110 hover:duration-150 transition-colors text-white px-8 py-3 rounded-full w-fit font-black text-sm tracking-wide">
                Get Sipping!
              </button>
            </a>
          </div>
        </div>

      </div>

      {/* Sip, Earn, Repeat */}
      <div className="w-full bg-[#B696C6]">
        <WaveDivider fill="#812990"/>
        
        <div className="w-full flex flex-col md:flex-row justify-center items-center pt-16 md:pt-32 pb-20 gap-10 md:gap-32 px-6">
          {/* Text Content */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left text-white max-w-2xl">
            <p className="font-bold tracking-widest uppercase mb-2">
              Loyal-Tea
            </p>
            <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-wide">
              Sip, Earn, Repeat
            </h2>
            <p className="text-base md:text-lg mb-8 font-medium leading-relaxed">
              Sign up now to enjoy a refreshing 50% off your first tea, earn points with every purchase and get access to member-only offers.
            </p>
            <a href="https://chatime.com.au/loyal-tea-club/">
              <button className="bg-[#00A862] hover:bg-white hover:text-[#00A862] hover:scale-110 hover:duration-150 transition-colors text-white px-8 py-3 rounded-full w-fit font-black text-sm tracking-wide">
                Explore More
              </button>
            </a>
          </div>
          
          <div className="relative">
            <Image 
              src="/Round_baller.webp" 
              width={220} 
              height={450} 
              alt="Chatime Loyalty App" 
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Join The Par-tea (Footer) Section */}
      <div className="w-full bg-[#F5F2F5]">
        <WaveDivider fill="#B696C6"/>
        
        <div className="flex flex-col items-center pt-16 pb-12 px-6">
          <h1 className="text-[#F25A70] text-6xl md:text-8xl font-black text-center leading-[0.9] tracking-tighter mb-10">
            JOIN THE<br />PAR-TEA
          </h1>
          
          <div className="flex flex-row gap-6 mb-16">
            <a href="https://www.instagram.com/chatimeaustralia/" className="bg-white p-3 rounded-full text-[#500778] hover:scale-110 transition-transform shadow-md">
              <FaInstagram size="1.5em"/>
            </a>
            <a href="https://www.tiktok.com/@chatimeau" className="bg-white p-3 rounded-full text-[#500778] hover:scale-110 transition-transform shadow-md">
              <FaTiktok size="1.5em"/>
            </a>
            <a href="https://www.facebook.com/CHATIMEAustralia" className="bg-white p-3 rounded-full text-[#500778] hover:scale-110 transition-transform shadow-md">
              <FaFacebook size="1.5em"/>
            </a>
            <a href="https://www.linkedin.com/company/chatimegroup/" className="bg-white p-3 rounded-full text-[#500778] hover:scale-110 transition-transform shadow-md">
              <FaLinkedin size="1.5em"/>
            </a>
          </div>

          <div className="mb-8">
            <Image
              src="chatime-stacked-white-YLD3ICQX.svg"
              width={60}
              height={60}
              alt="Picture of the author"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] md:text-xs text-[#500778] font-bold text-center max-w-4xl">
            <a href="https://chatime.redcatcloud.com.au/app/purchase-gift-card" className="hover:underline">Gift Cards</a>
            <a href="https://portal.chatime.com.au/faqs/" className="hover:underline">FAQs</a>
            <a href="https://portal.chatime.com.au/join-our-team/" className="hover:underline">Join Our Team</a>
            <a href="https://portal.chatime.com.au/contact-us/" className="hover:underline">Contact Us</a>
            <a href="https://portal.chatime.com.au/terms/" className="hover:underline">Loyal-Tea Terms and Conditions</a>
            <a href="https://portal.chatime.com.au/offer-tcs/" className="hover:underline">Terms & Conditions</a>
            <a href="https://portal.chatime.com.au/privacy/" className="hover:underline">Privacy Policy</a>
            <a href="https://portal.chatime.com.au/allergen-information/" className="hover:underline">Allergen Information</a>
          </div>
        </div>
      </div>
      
    </div>
  )
}

// Shoutout to my boys at https://www.shapedivider.app/
function WaveDivider({ fill }: { fill: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1440 120" 
      className="w-full block"
    >
      <path 
        fill={fill} 
        fillOpacity="1" 
        d="M0,96L60,90.7C120,85,240,75,360,64C480,53,600,43,720,53.3C840,64,960,96,1080,112C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
      ></path>
    </svg>
  );
}
