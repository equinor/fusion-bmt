using System;
using System.Linq;
using System.Collections;
using System.Collections.Generic;


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

        public static Barrier Barrier()
        {
            return RandomEnumValue<Barrier>();
        }

        public static Progression Progression()
        {
            return RandomEnumValue<Progression>();
        }

        public static Severity Severity()
        {
            return RandomEnumValue<Severity>();
        }

        public static Priority Priority()
        {
            return RandomEnumValue<Priority>();
        }

        public static Status Status()
        {
            return RandomEnumValue<Status>();
        }

        public static T Value<T>(ICollection<T> values)
        {
            int pick = random.Next(values.Count);
            return values.ElementAt(pick);
        }

        private static T RandomEnumValue<T>()
        {
            Array values = Enum.GetValues(typeof(T));
            return (T)values.GetValue(random.Next(values.Length));
        }
    }
}
