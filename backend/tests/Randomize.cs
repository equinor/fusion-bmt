using System;

using api.Models;


namespace tests
{
    public static class Randomize
    {
        private static Random random = new Random();
        private static string alphanumeric =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789";

        public static string Integer()
        {
            return random.Next(Int32.MinValue, Int32.MaxValue).ToString();
        }

        /* Random alphanumeric string of 8-32 characters */
        public static string String()
        {
            char[] chars = new char[random.Next(8, 32)];

            for (int i = 0; i < chars.Length; i++)
            {
                chars[i] = alphanumeric[random.Next(alphanumeric.Length)];
            }

            return new String(chars);
        }

        public static Role Role()
        {
            return RandomEnumValue<Role>();
        }

        public static Organization Organization()
        {
            return RandomEnumValue<Organization>();
        }

        private static T RandomEnumValue<T>()
        {
            Array values = Enum.GetValues(typeof(T));
            return (T)values.GetValue(random.Next(values.Length));
        }
    }
}
